import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from .utils import get_leaderboard_payload


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
        return get_leaderboard_payload(limit=100, use_cache=True)
