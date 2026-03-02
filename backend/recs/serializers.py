from rest_framework import serializers
from .models import Recommendation, TechRecommendation


class RecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recommendation
        fields = ["id", "category", "title", "description", "priority", "action_url", "is_resolved", "created_at"]


class TechRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TechRecommendation
        fields = ["id", "technology", "category", "reason", "learning_resources", "priority", "career_impact", "is_dismissed", "created_at"]
