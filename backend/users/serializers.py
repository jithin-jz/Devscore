from rest_framework import serializers
from .models import DeveloperProfile


class ProfileSerializer(serializers.ModelSerializer):
    """Full profile for authenticated user."""

    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    id = serializers.CharField(read_only=True)

    is_admin = serializers.BooleanField(source="user.is_superuser", read_only=True)

    class Meta:
        model = DeveloperProfile
        fields = [
            "id",
            "username",
            "email",
            "github_username",
            "avatar_url",
            "bio",
            "dev_score",
            "tier",
            "analysis_status",
            "last_analyzed",
            "created_at",
            "is_admin",
        ]
        read_only_fields = [
            "github_username",
            "dev_score",
            "tier",
            "analysis_status",
            "last_analyzed",
            "created_at",
        ]
