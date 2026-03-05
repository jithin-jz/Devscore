import logging
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from urllib.parse import quote

logger = logging.getLogger(__name__)

GITHUB_API_BASE = "https://api.github.com"


class GitHubClient:
    """Wrapper around GitHub REST API."""

    def __init__(self, token):
        self.token = token
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github.v3+json",
        }
        self.session = self._build_session()

    def _build_session(self):
        session = requests.Session()
        retry = Retry(
            total=3,
            connect=3,
            read=3,
            backoff_factor=0.4,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["GET"],
            raise_on_status=False,
        )
        adapter = HTTPAdapter(max_retries=retry, pool_connections=20, pool_maxsize=20)
        session.mount("https://", adapter)
        session.mount("http://", adapter)
        session.headers.update(self.headers)
        return session

    def _get(self, url, params=None, return_response=False):
        """Make an authenticated GET request to GitHub API."""
        try:
            response = self.session.get(url, params=params, timeout=15)
            response.raise_for_status()
            if return_response:
                return response
            if not response.text:
                return None
            return response.json()
        except requests.RequestException as e:
            logger.error(f"GitHub API error: {e}")
            return None

    def _get_paginated(self, url, params=None, max_pages=10):
        """Fetch all pages of a paginated GitHub API response."""
        params = params or {}
        per_page = params.get("per_page", 100)

        results = []
        for page in range(1, max_pages + 1):
            page_params = {**params, "per_page": per_page, "page": page}
            response = self._get(url, page_params, return_response=True)
            if not response:
                break
            data = response.json() if response.text else []
            if not data:
                break
            results.extend(data)
            if len(data) < per_page:
                break
            if 'rel="next"' not in response.headers.get("Link", ""):
                break
        return results

    def get_user_repos(self):
        """Fetch all public repos for the authenticated user."""
        return self._get_paginated(
            f"{GITHUB_API_BASE}/user/repos",
            params={"type": "owner", "sort": "updated"},
        )

    def get_repo_details(self, full_name):
        """Fetch repository metadata."""
        return self._get(f"{GITHUB_API_BASE}/repos/{full_name}")

    def get_repo_contents(self, full_name, path=""):
        """Get contents of a repository path."""
        return self._get(f"{GITHUB_API_BASE}/repos/{full_name}/contents/{path}")

    def get_repo_languages(self, full_name):
        """Get language breakdown for a repository."""
        return self._get(f"{GITHUB_API_BASE}/repos/{full_name}/languages")

    def check_path_exists(self, full_name, path):
        """Check if a file or directory exists in a repository."""
        try:
            response = self.session.get(
                f"{GITHUB_API_BASE}/repos/{full_name}/contents/{path}",
                timeout=10,
            )
            return response.status_code == 200
        except requests.RequestException:
            return False

    def get_user_events(self, username, max_pages=3):
        """Fetch recent public events for a user."""
        return self._get_paginated(
            f"{GITHUB_API_BASE}/users/{username}/events/public",
            max_pages=max_pages,
        )

    def get_repo_tree(self, full_name, branch, recursive=True):
        params = {"recursive": 1} if recursive else None
        branch_ref = quote(branch, safe="")
        return self._get(
            f"{GITHUB_API_BASE}/repos/{full_name}/git/trees/{branch_ref}",
            params=params,
        )

    def detect_repo_features(self, full_name):
        """
        Detect CI, tests, Docker, lint, and type configs in a repository.
        Uses the repo tree to avoid many per-path API calls.
        """
        features = {
            "has_ci": False,
            "has_tests": False,
            "has_docker": False,
            "has_lint": False,
            "has_types": False,
        }

        details = self.get_repo_details(full_name) or {}
        default_branch = details.get("default_branch") or "main"
        tree_data = self.get_repo_tree(full_name, default_branch, recursive=True) or {}
        tree_nodes = tree_data.get("tree", [])

        if tree_nodes:
            all_paths = [str(node.get("path", "")).strip("/").lower() for node in tree_nodes if node.get("path")]
            root_entries = {path.split("/", 1)[0] for path in all_paths}
            root_files = {entry for entry in root_entries if entry}

            features["has_ci"] = (
                any(path.startswith(".github/workflows/") for path in all_paths)
                or ".circleci" in root_entries
                or ".travis.yml" in root_files
                or "jenkinsfile" in root_files
            )

            features["has_tests"] = (
                any(entry in {"tests", "test", "__tests__", "spec"} for entry in root_entries)
                or any(entry.startswith("test_") for entry in root_entries)
                or "pytest.ini" in root_files
                or "jest.config.js" in root_files
            )

            features["has_docker"] = (
                "dockerfile" in root_files
                or "docker-compose.yml" in root_files
                or "docker-compose.yaml" in root_files
            )

            lint_files = {
                ".eslintrc",
                ".eslintrc.js",
                ".eslintrc.json",
                "pyproject.toml",
                ".flake8",
                ".pylintrc",
                ".prettierrc",
                "biome.json",
                "ruff.toml",
            }
            features["has_lint"] = any(path in root_files for path in lint_files)

            type_files = {"tsconfig.json", "mypy.ini", ".mypy.ini", "py.typed"}
            features["has_types"] = any(path in root_files for path in type_files)

            return features

        # Fallback if tree API fails/rate-limits.
        ci_paths = [".github/workflows", ".circleci", ".travis.yml", "Jenkinsfile"]
        test_paths = ["tests", "test", "__tests__", "spec", "test_", "pytest.ini", "jest.config.js"]
        docker_paths = ["Dockerfile", "docker-compose.yml", "docker-compose.yaml"]
        lint_paths = [
            ".eslintrc",
            ".eslintrc.js",
            ".eslintrc.json",
            "pyproject.toml",
            ".flake8",
            ".pylintrc",
            ".prettierrc",
            "biome.json",
            "ruff.toml",
        ]
        type_paths = ["tsconfig.json", "mypy.ini", ".mypy.ini", "py.typed"]

        for path in ci_paths:
            if self.check_path_exists(full_name, path):
                features["has_ci"] = True
                break
        for path in test_paths:
            if self.check_path_exists(full_name, path):
                features["has_tests"] = True
                break
        for path in docker_paths:
            if self.check_path_exists(full_name, path):
                features["has_docker"] = True
                break
        for path in lint_paths:
            if self.check_path_exists(full_name, path):
                features["has_lint"] = True
                break
        for path in type_paths:
            if self.check_path_exists(full_name, path):
                features["has_types"] = True
                break

        return features
