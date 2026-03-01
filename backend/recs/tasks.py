import logging
from celery import shared_task
from django.contrib.auth.models import User

from github.models import Repository
from scoring.models import ScoreBreakdown
from .models import Recommendation
from .engine import generate_ai_recs

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=2, default_retry_delay=30)
def generate_recs(self, user_id):
    """Generate improvement recs based on current scores."""
    try:
        user = User.objects.get(id=user_id)
        breakdown = ScoreBreakdown.objects.get(user=user)
        repos = list(Repository.objects.filter(user=user))

        score_dict = breakdown.to_dict()
        recs = generate_ai_recs(score_dict, repos, user.username)

        # Clear old unresolved recs
        Recommendation.objects.filter(user=user, is_resolved=False).delete()

        # Create new ones
        for rec in recs:
            Recommendation.objects.create(user=user, **rec)

        logger.info(f"Generated {len(recs)} recs for {user.username}")
        return {"user_id": user_id, "count": len(recs)}

    except Exception as exc:
        logger.error(f"Error generating recs for user {user_id}: {exc}")
        self.retry(exc=exc)
