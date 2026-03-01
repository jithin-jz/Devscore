import json
import logging
from groq import Groq
from django.conf import settings

logger = logging.getLogger(__name__)


def generate_ai_recs(score_breakdown, repos, username):
    """
    Generate personalized architectural growth recs.
    Uses Groq AI to analyze current state and suggest next steps.
    """
    if not getattr(settings, "GROQ_API_KEY", None):
        logger.error("GROQ_API_KEY not configured. AI recs unavailable.")
        return []

    try:
        client = Groq(api_key=settings.GROQ_API_KEY)

        # Limit repos to top 10 most relevant to keep context window clean
        top_repos = sorted(repos, key=lambda r: r.stars + r.forks, reverse=True)[:10]
        repo_data = []
        for r in top_repos:
            repo_data.append(
                {
                    "name": r.full_name,
                    "lang": r.primary_language,
                    "stars": r.stars,
                    "features": {
                        "ci": r.has_ci,
                        "tests": r.has_tests,
                        "docker": r.has_docker,
                        "lint": r.has_lint,
                        "types": r.has_types,
                    },
                }
            )

        prompt = f"""
        User: {username}
        Metrics: {json.dumps(score_breakdown)}
        Projects Sample: {json.dumps(repo_data)}

        Act as an Executive Engineering Coach. Write 3 highly specific, technical 'Growth Vectors' for this developer.
        FORMAT (JSON ONLY). Reply with a valid JSON array of objects:
        [
          {{
            "title": "Title",
            "category": "engineering_depth | discipline | collaboration | consistency | oss_impact",
            "description": "Advice + why it helps (2-3 sentences)",
            "priority": "high | medium | low",
            "action_url": "URL for tools or guides"
          }}
        ]
        """

        response = client.chat.completions.create(
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
            return []

        import re

        json_match = re.search(r"\[.*\]", res_text, re.DOTALL)
        if json_match:
            try:
                data = json.loads(json_match.group())
                # Ensure each record is lowercase category and priority
                for rec in data:
                    if "category" in rec:
                        rec["category"] = rec["category"].lower()
                    if "priority" in rec:
                        rec["priority"] = rec["priority"].lower()
                return data
            except Exception:
                return []

        return []

    except Exception as e:
        logger.error(f"Recommendation engine failure: {e}")
        return []


def generate_recs_for_user(score_breakdown, repos, username):
    """Alias for backwards compatibility if needed, but we mostly fix the callers."""
    return generate_ai_recs(score_breakdown, repos, username)
