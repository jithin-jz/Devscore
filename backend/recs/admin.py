from django.contrib import admin
from .models import Recommendation


@admin.register(Recommendation)
class RecommendationAdmin(admin.ModelAdmin):
    list_display = ["user", "category", "title", "priority", "is_resolved", "created_at"]
    list_filter = ["category", "priority", "is_resolved"]
