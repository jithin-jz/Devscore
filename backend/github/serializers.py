from rest_framework import serializers
from .models import Repository, RepositoryAudit


class RepositoryAuditSerializer(serializers.ModelSerializer):
    class Meta:
        model = RepositoryAudit
        fields = [
            "summary",
            "strengths",
            "weaknesses",
            "suggestions",
            "architecture_score",
            "audited_at",
        ]


class RepositorySerializer(serializers.ModelSerializer):
    audit = RepositoryAuditSerializer(read_only=True)

    class Meta:
        model = Repository
        fields = [
            "id",
            "name",
            "full_name",
            "description",
            "primary_language",
            "stars",
            "forks",
            "is_fork",
            "has_ci",
            "has_tests",
            "has_docker",
            "has_lint",
            "has_types",
            "repo_updated_at",
            "audit",
        ]
