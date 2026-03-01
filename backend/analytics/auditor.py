import json
import logging
from groq import Groq
from django.conf import settings
from github.github_client import GitHubClient

logger = logging.getLogger(__name__)


def perform_deep_audit(repository, token):
    """
    Perform a deep architectural audit of a repository using Groq AI.
    Analyzes file structure, key configuration files, and metadata.
    """
    if not getattr(settings, "GROQ_API_KEY", None):
        logger.error("GROQ_API_KEY not configured. AI audit unavailable.")
        return None

    try:
        client = GitHubClient(token)
        # 1. Fetch Repository Details to get default branch
        repo_details = client.get_repo_details(repository.full_name)
        default_branch = repo_details.get("default_branch", "main") if repo_details else "main"

        # 2. Fetch File Tree
        tree_res = client._get(
            f"https://api.github.com/repos/{repository.full_name}/git/trees/{default_branch}?recursive=1"
        )
        if not tree_res:
            tree_res = client._get(f"https://api.github.com/repos/{repository.full_name}/git/trees/{default_branch}")

        tree_data = tree_res if tree_res else {}
        tree_nodes = tree_data.get("tree", [])
        file_list = [t["path"] for t in tree_nodes if t["type"] == "blob"][:80]

        if not file_list:
            logger.warning(f"No files found for {repository.full_name} on {default_branch}")

        # 3. Fetch Content of Key Files
        key_files = ["package.json", "requirements.txt", "Dockerfile", "docker-compose.yml", "README.md"]
        file_contents = {}
        for kf in key_files:
            try:
                content = client.get_repo_contents(repository.full_name, kf)
                if content and "content" in content:
                    import base64

                    decoded = base64.b64decode(content["content"]).decode("utf-8")
                    file_contents[kf] = decoded[:1200]
            except Exception:
                continue

        # 4. Groq Scan
        groq_client = Groq(api_key=settings.GROQ_API_KEY)

        prompt = f"""
        Architectural Audit: {repository.full_name}.
        Description: {repository.description}

        TREE: {json.dumps(file_list)}
        CONFIGS: {json.dumps(file_contents)}

        TASK: staff-level audit. Reply with RAW JSON matches schema:
        {{
          "summary": "...",
          "strengths": [{{ "title": "...", "description": "..." }}],
          "weaknesses": [{{ "title": "...", "description": "..." }}],
          "suggestions": [{{ "title": "...", "description": "..." }}],
          "architecture_score": 0-100
        }}
        """

        response = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"},
        )

        res_text = response.choices[0].message.content
        if not res_text:
            return None

        import re

        json_match = re.search(r"\{.*\}", res_text, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group())
            except Exception:
                pass

        return None

    except Exception as e:
        if "429" in str(e):
            logger.warning(f"Groq Rate Limit hit for {repository.full_name}, re-raising for retry.")
            raise e
        else:
            logger.error(f"Deep Audit error for {repository.full_name}: {e}")
        return None
