from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.core.cache import cache
from .models import DeveloperProfile

LEADERBOARD_CACHE_TTL_SECONDS = 30


def _leaderboard_cache_key(limit):
    return f"leaderboard:top:{limit}"


def get_leaderboard_payload(limit=100, use_cache=True):
    cache_key = _leaderboard_cache_key(limit)
    if use_cache:
        cached = cache.get(cache_key)
        if cached is not None:
            return cached

    profiles = (
        DeveloperProfile.objects.select_related("user")
        .exclude(dev_score=0.0)
        .order_by("-dev_score")
        .only(
            "id",
            "github_username",
            "avatar_url",
            "bio",
            "dev_score",
            "tier",
            "analysis_status",
            "user__username",
            "user__is_superuser",
        )[:limit]
    )

    results = [
        {
            "id": str(profile.id),
            "username": profile.user.username,
            "github_username": profile.github_username,
            "avatar_url": profile.avatar_url,
            "bio": profile.bio,
            "dev_score": profile.dev_score,
            "tier": profile.tier,
            "analysis_status": profile.analysis_status,
            "is_admin": profile.user.is_superuser,
        }
        for profile in profiles
    ]

    cache.set(cache_key, results, LEADERBOARD_CACHE_TTL_SECONDS)
    return results


def broadcast_leaderboard():
    """
    Fetch the top 100 profiles and broadcast to the 'leaderboard' WebSocket group.
    Can be called synchronously from anywhere in Django (like views or Celery tasks).
    """
    channel_layer = get_channel_layer()
    if not channel_layer:
        return

    # Refresh cache with the latest leaderboard before broadcasting.
    results = get_leaderboard_payload(limit=100, use_cache=False)

    # Send message to the group
    async_to_sync(channel_layer.group_send)(
        "leaderboard",
        {
            "type": "leaderboard_update",
            "data": results,
        }
    )
