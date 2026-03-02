from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import DeveloperProfile


def broadcast_leaderboard():
    """
    Fetch the top 100 profiles and broadcast to the 'leaderboard' WebSocket group.
    Can be called synchronously from anywhere in Django (like views or Celery tasks).
    """
    channel_layer = get_channel_layer()
    if not channel_layer:
        return

    # Fetch top 100 users ordered by descending dev_score
    profiles = list(DeveloperProfile.objects.exclude(dev_score=0.0).order_by("-dev_score")[:100])
    
    results = []
    for p in profiles:
        results.append({
            "id": str(p.id),
            "username": p.user.username,
            "github_username": p.github_username,
            "avatar_url": p.avatar_url,
            "bio": p.bio,
            "dev_score": p.dev_score,
            "tier": p.tier,
            "analysis_status": p.analysis_status,
            "is_admin": p.user.is_superuser,
        })

    # Send message to the group
    async_to_sync(channel_layer.group_send)(
        "leaderboard",
        {
            "type": "leaderboard_update",
            "data": results,
        }
    )
