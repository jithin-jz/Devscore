from django.db import models
from django.contrib.auth.models import User


class Repository(models.Model):
    """Represents a GitHub repository belonging to a user."""

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="repositories"
    )
    name = models.CharField(max_length=255)
    full_name = models.CharField(max_length=500)
    description = models.TextField(blank=True, default="")
    primary_language = models.CharField(max_length=100, blank=True, default="")
    stars = models.IntegerField(default=0)
    forks = models.IntegerField(default=0)
    is_fork = models.BooleanField(default=False)
    has_ci = models.BooleanField(default=False)
    has_tests = models.BooleanField(default=False)
    has_docker = models.BooleanField(default=False)
    has_lint = models.BooleanField(default=False)
    has_types = models.BooleanField(default=False)
    size_kb = models.IntegerField(default=0)
    open_issues_count = models.IntegerField(default=0)
    repo_created_at = models.DateTimeField(null=True, blank=True)
    repo_updated_at = models.DateTimeField(null=True, blank=True)
    analyzed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["user", "full_name"]
        ordering = ["-stars"]
        indexes = [
            models.Index(fields=["user", "-stars"], name="repo_user_stars_idx"),
            models.Index(
                fields=["user", "repo_updated_at"], name="repo_user_updated_idx"
            ),
            models.Index(fields=["user", "analyzed_at"], name="repo_user_analyzed_idx"),
        ]

    def __str__(self):
        return self.full_name


class ContributionMetrics(models.Model):
    """Aggregated contribution metrics for a user."""

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="contribution_metrics"
    )
    total_commits = models.IntegerField(default=0)
    pr_opened = models.IntegerField(default=0)
    pr_merged = models.IntegerField(default=0)
    issues_opened = models.IntegerField(default=0)
    issues_closed = models.IntegerField(default=0)
    external_contributions = models.IntegerField(default=0)
    active_days = models.IntegerField(default=0)
    streak_max = models.IntegerField(default=0)
    last_fetched = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Contribution Metrics"

    def __str__(self):
        return f"Metrics for {self.user.username}"


class RepositoryAudit(models.Model):
    """Deep AI-driven architectural analysis of a repository."""

    repository = models.OneToOneField(
        Repository, on_delete=models.CASCADE, related_name="audit"
    )
    summary = models.TextField()
    strengths = models.JSONField(
        default=list
    )  # List of dicts: { "title": "...", "description": "..." }
    weaknesses = models.JSONField(default=list)
    suggestions = models.JSONField(default=list)
    architecture_score = models.IntegerField(default=0)  # 0-100
    audited_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Audit: {self.repository.full_name}"
