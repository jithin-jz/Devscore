from django.contrib import admin
from .models import DeveloperProfile


@admin.register(DeveloperProfile)
class DeveloperProfileAdmin(admin.ModelAdmin):
    list_display = [
        "github_username",
        "dev_score",
        "tier",
        "analysis_status",
        "last_analyzed",
    ]
    list_filter = ["tier", "analysis_status"]
    search_fields = ["github_username", "user__email"]
    readonly_fields = ["created_at", "updated_at"]
