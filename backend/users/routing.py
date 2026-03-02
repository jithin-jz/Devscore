from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path("ws/leaderboard/", consumers.LeaderboardConsumer.as_asgi()),
]
