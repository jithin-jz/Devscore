import logging
from background_task import background
from django.contrib.auth.models import User

from github.models import Repository
from scoring.models import ScoreBreakdown
from .models import Recommendation, TechRecommendation
from .engine import generate_ai_recs, generate_tech_recs

logger = logging.getLogger(__name__)


@background(schedule=0)
def generate_recs(user_id):
    """Generate improvement recs based on current scores."""
    try:
        user = User.objects.get(id=user_id)
        breakdown = ScoreBreakdown.objects.get(user=user)
        repos = list(
            Repository.objects.filter(user=user).only(
                "full_name",
                "primary_language",
                "stars",
                "forks",
                "has_ci",
                "has_tests",
                "has_docker",
                "has_lint",
                "has_types",
            )
        )

        score_dict = breakdown.to_dict()
        recs = generate_ai_recs(score_dict, repos, user.username)

        # Clear old unresolved recs
        Recommendation.objects.filter(user=user, is_resolved=False).delete()

        # Create new ones
        if recs:
            Recommendation.objects.bulk_create(
                [Recommendation(user=user, **rec) for rec in recs],
                batch_size=100,
            )

        logger.info(f"Generated {len(recs)} recs for {user.username}")

    except Exception as exc:
        logger.error(f"Error generating recs for user {user_id}: {exc}")
        raise exc


@background(schedule=0)
def generate_tech_recs_task(user_id):
    """Generate tech stack recommendations based on current profile and scores."""
    try:
        user = User.objects.select_related("profile").get(id=user_id)
        breakdown = ScoreBreakdown.objects.get(user=user)
        repos = list(
            Repository.objects.filter(user=user).only(
                "primary_language",
                "has_tests",
                "has_docker",
                "has_ci",
                "has_lint",
                "has_types",
            )
        )
        profile = user.profile

        score_dict = breakdown.to_dict()
        tech_recs = generate_tech_recs(score_dict, repos, user.username, profile.tier)

        # Clear old non-dismissed tech recs
        TechRecommendation.objects.filter(user=user, is_dismissed=False).delete()

        # Create new ones
        rows = []
        for rec in tech_recs:
            rows.append(
                TechRecommendation(
                    user=user,
                    technology=rec.get("technology", ""),
                    category=rec.get("category", "tool"),
                    reason=rec.get("reason", ""),
                    learning_resources=rec.get("learning_resources", {}),
                    priority=rec.get("priority", "medium"),
                    career_impact=rec.get("career_impact", ""),
                )
            )
        if rows:
            TechRecommendation.objects.bulk_create(rows, batch_size=100)

        logger.info(f"Generated {len(rows)} tech recs for {user.username}")

    except Exception as exc:
        logger.error(f"Error generating tech recs for user {user_id}: {exc}")
        raise exc
