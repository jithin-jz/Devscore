import logging
from datetime import datetime, timezone

from background_task import background
from django.contrib.auth.models import User

from github.models import Repository, ContributionMetrics
from users.models import DeveloperProfile
from .models import ScoreBreakdown, ScoreHistory, ScoringConfig
from .engine import (
    calculate_engineering_depth,
    calculate_discipline,
    calculate_collaboration,
    calculate_consistency,
    calculate_oss_impact,
    calculate_dev_score,
)
from users.utils import broadcast_leaderboard

logger = logging.getLogger(__name__)


@background(schedule=0)
def calculate_user_score(user_id):
    """Calculate all category scores and final DevScore for a user."""
    try:
        user = User.objects.select_related("profile").get(id=user_id)
        repos = list(
            Repository.objects.filter(user=user).only(
                "primary_language",
                "has_ci",
                "has_docker",
                "has_tests",
                "has_lint",
                "has_types",
                "is_fork",
                "stars",
                "forks",
            )
        )
        metrics = ContributionMetrics.objects.filter(user=user).first()
        weights = ScoringConfig.get_weights()

        # Calculate each category
        engineering = calculate_engineering_depth(repos)
        discipline = calculate_discipline(repos)
        collaboration = calculate_collaboration(metrics)
        consistency = calculate_consistency(metrics)
        oss_impact = calculate_oss_impact(repos)

        breakdown_dict = {
            "engineering_depth": round(engineering, 1),
            "discipline": round(discipline, 1),
            "collaboration": round(collaboration, 1),
            "consistency": round(consistency, 1),
            "oss_impact": round(oss_impact, 1),
        }

        final_score = calculate_dev_score(breakdown_dict, weights)

        # Save breakdown
        ScoreBreakdown.objects.update_or_create(
            user=user,
            defaults={
                **breakdown_dict,
                "last_calculated": datetime.now(timezone.utc),
            },
        )

        # Save history
        ScoreHistory.objects.create(
            user=user,
            score=final_score,
            breakdown_snapshot=breakdown_dict,
        )

        # Update profile
        profile = user.profile
        profile.dev_score = final_score
        profile.tier = DeveloperProfile.compute_tier(final_score)
        profile.last_analyzed = datetime.now(timezone.utc)
        profile.analysis_status = "complete"
        profile.save(update_fields=["dev_score", "tier", "last_analyzed", "analysis_status"])

        # Broadcast the new leaderboard via WebSockets
        try:
            broadcast_leaderboard()
        except Exception as e:
            logger.error(f"Failed to broadcast leaderboard: {e}")

        logger.info(f"Calculated DevScore for {user.username}: {final_score} ({profile.tier})")

        # Trigger recommendations engine
        from recs.tasks import generate_recs, generate_tech_recs_task
        generate_recs(user_id, schedule=1)
        generate_tech_recs_task(user_id, schedule=1)

    except Exception as exc:
        logger.error(f"Error calculating score for user {user_id}: {exc}")
        try:
            user = User.objects.get(id=user_id)
            user.profile.analysis_status = "failed"
            user.profile.save(update_fields=["analysis_status"])
        except Exception:
            pass
        raise exc
