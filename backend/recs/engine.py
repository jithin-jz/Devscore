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


def generate_tech_recs(score_breakdown, repos, username, tier):
    """
    Generate AI-powered technology learning recommendations.
    Analyzes user's current stack, score gaps, and career level to suggest
    technologies to learn next.
    """
    if not getattr(settings, "GROQ_API_KEY", None):
        logger.error("GROQ_API_KEY not configured. Tech recs unavailable.")
        return []

    try:
        client = Groq(api_key=settings.GROQ_API_KEY)

        # Extract current languages from repos
        languages = list(set(r.primary_language for r in repos if r.primary_language))

        # Identify gaps from score breakdown
        gaps = []
        if score_breakdown:
            if score_breakdown.get("discipline", 0) < 40:
                gaps.append("testing/quality assurance")
            if score_breakdown.get("engineering_depth", 0) < 40:
                gaps.append("system design/architecture")
            if score_breakdown.get("collaboration", 0) < 40:
                gaps.append("team collaboration/code reviews")
            if score_breakdown.get("consistency", 0) < 40:
                gaps.append("consistent coding habits")
            if score_breakdown.get("oss_impact", 0) < 40:
                gaps.append("open source contributions")

        # Identify missing repo features
        has_tests = any(r.has_tests for r in repos)
        has_docker = any(r.has_docker for r in repos)
        has_ci = any(r.has_ci for r in repos)
        has_lint = any(r.has_lint for r in repos)
        has_types = any(r.has_types for r in repos)

        feature_gaps = []
        if not has_tests:
            feature_gaps.append("testing frameworks")
        if not has_docker:
            feature_gaps.append("containerization")
        if not has_ci:
            feature_gaps.append("CI/CD pipelines")
        if not has_lint:
            feature_gaps.append("linting/formatting")
        if not has_types:
            feature_gaps.append("type systems")

        prompt = f"""
        User: {username}
        Current Tier: {tier}
        Current Languages: {json.dumps(languages)}
        Current Score Gaps: {json.dumps(gaps)}
        Missing Repo Features: {json.dumps(feature_gaps)}
        Score Breakdown: {json.dumps(score_breakdown)}

        Act as a Tech Career Advisor and Senior Developer. Recommend 5 technologies this developer should learn next.
        
        Consider:
        1. Fill skill gaps (e.g., no testing → learn testing frameworks)
        2. Next-tier prerequisites (e.g., Architect tier needs system design, cloud)
        3. Market demand and career growth
        4. Complementary technologies to their current stack
        
        FORMAT (JSON ONLY). Reply with a valid JSON array of objects:
        [
          {{
            "technology": "Tech Name",
            "category": "language | framework | tool | cloud | practice",
            "reason": "Why they should learn this (1-2 sentences)",
            "learning_resources": {{
              "beginner": "free beginner resource URL",
              "intermediate": "free intermediate resource URL", 
              "advanced": "free advanced resource URL"
            }},
            "priority": "high | medium | low",
            "career_impact": "Brief insight on demand/salary impact"
          }}
        ]
        
        Only use free resources. Use well-known URLs like freeCodeCamp, official docs, etc.
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
                # Normalize category and priority to lowercase
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
        logger.error(f"Tech recommendation engine failure: {e}")
        return []


def generate_recs_for_user(score_breakdown, repos, username):
    """Alias for backwards compatibility if needed, but we mostly fix the callers."""
    return generate_ai_recs(score_breakdown, repos, username)
