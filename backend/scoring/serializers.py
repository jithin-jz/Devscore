from rest_framework import serializers
from .models import ScoreBreakdown, ScoreHistory


class ScoreBreakdownSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScoreBreakdown
        fields = ["engineering_depth", "collaboration", "discipline", "consistency", "oss_impact", "last_calculated"]


class ScoreHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ScoreHistory
        fields = ["score", "breakdown_snapshot", "created_at"]
