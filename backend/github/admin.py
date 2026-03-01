from django.contrib import admin
from .models import Repository, ContributionMetrics


@admin.register(Repository)
class RepositoryAdmin(admin.ModelAdmin):
    list_display = ["full_name", "user", "primary_language", "stars", "has_ci", "has_tests", "analyzed_at"]
    list_filter = ["primary_language", "has_ci", "has_tests", "has_docker", "has_lint"]
    search_fields = ["full_name", "user__username"]


@admin.register(ContributionMetrics)
class ContributionMetricsAdmin(admin.ModelAdmin):
    list_display = ["user", "total_commits", "pr_opened", "pr_merged", "external_contributions", "last_fetched"]
