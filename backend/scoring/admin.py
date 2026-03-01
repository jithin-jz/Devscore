from django.contrib import admin
from .models import ScoreBreakdown, ScoreHistory, ScoringConfig


@admin.register(ScoreBreakdown)
class ScoreBreakdownAdmin(admin.ModelAdmin):
    list_display = [
        "user",
        "engineering_depth",
        "collaboration",
        "discipline",
        "consistency",
        "oss_impact",
        "last_calculated",
    ]


@admin.register(ScoreHistory)
class ScoreHistoryAdmin(admin.ModelAdmin):
    list_display = ["user", "score", "created_at"]
    list_filter = ["user"]


@admin.register(ScoringConfig)
class ScoringConfigAdmin(admin.ModelAdmin):
    list_display = [
        "weight_engineering",
        "weight_discipline",
        "weight_collaboration",
        "weight_consistency",
        "weight_oss",
    ]
