from rest_framework import serializers
from .models import Recommendation


class RecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recommendation
        fields = ["id", "category", "title", "description", "priority", "action_url", "is_resolved", "created_at"]
