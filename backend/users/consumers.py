import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import DeveloperProfile
from asgiref.sync import sync_to_async


class LeaderboardConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Join the leaderboard group
        await self.channel_layer.group_add(
            "leaderboard",
            self.channel_name
        )
        await self.accept()
        
        # Send initial the leaderboard when a client connects
        leaderboard_data = await self.get_top_100()
        await self.send(text_data=json.dumps({
            "type": "leaderboard_update",
            "data": leaderboard_data
        }))

    async def disconnect(self, close_code):
        # Leave group
        await self.channel_layer.group_discard(
            "leaderboard",
            self.channel_name
        )

    async def leaderboard_update(self, event):
        """Handler for the `leaderboard_update` message type."""
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            "type": "leaderboard_update",
            "data": event["data"]
        }))

    @sync_to_async
    def get_top_100(self):
        """Fetch top 100 users ordered by descending dev_score."""
        # Can't easily use DRF serializer inside async block, so we construct dicts
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
        return results
