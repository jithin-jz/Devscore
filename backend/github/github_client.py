import logging
import requests

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

    def _get(self, url, params=None):
        """Make an authenticated GET request to GitHub API."""
        try:
            response = requests.get(url, headers=self.headers, params=params, timeout=15)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"GitHub API error: {e}")
            return None

    def _get_paginated(self, url, params=None, max_pages=10):
        """Fetch all pages of a paginated GitHub API response."""
        if params is None:
            params = {}
        params.setdefault("per_page", 100)

        results = []
        for page in range(1, max_pages + 1):
            params["page"] = page
            data = self._get(url, params)
            if not data:
                break
            results.extend(data)
            if len(data) < params["per_page"]:
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
            response = requests.get(
                f"{GITHUB_API_BASE}/repos/{full_name}/contents/{path}",
                headers=self.headers,
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

    def detect_repo_features(self, full_name):
        """Detect CI, tests, Docker, lint, and type configs in a repository."""
        features = {
            "has_ci": False,
            "has_tests": False,
            "has_docker": False,
            "has_lint": False,
            "has_types": False,
        }

        # Check CI — GitHub Actions
        ci_paths = [".github/workflows", ".circleci", ".travis.yml", "Jenkinsfile"]
        for path in ci_paths:
            if self.check_path_exists(full_name, path):
                features["has_ci"] = True
                break

        # Check tests
        test_paths = ["tests", "test", "__tests__", "spec", "test_", "pytest.ini", "jest.config.js"]
        for path in test_paths:
            if self.check_path_exists(full_name, path):
                features["has_tests"] = True
                break

        # Check Docker
        docker_paths = ["Dockerfile", "docker-compose.yml", "docker-compose.yaml"]
        for path in docker_paths:
            if self.check_path_exists(full_name, path):
                features["has_docker"] = True
                break

        # Check lint configs
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
        for path in lint_paths:
            if self.check_path_exists(full_name, path):
                features["has_lint"] = True
                break

        # Check type usage
        type_paths = ["tsconfig.json", "mypy.ini", ".mypy.ini", "py.typed"]
        for path in type_paths:
            if self.check_path_exists(full_name, path):
                features["has_types"] = True
                break

        return features
