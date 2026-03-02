from django.db import models
from django.contrib.auth.models import User


class Recommendation(models.Model):
    """Actionable improvement recommendation for a user."""

    CATEGORY_CHOICES = [
        ("engineering_depth", "Engineering Depth"),
        ("discipline", "Code Discipline"),
        ("collaboration", "Collaboration"),
        ("consistency", "Consistency"),
        ("oss_impact", "OSS Impact"),
    ]

    PRIORITY_CHOICES = [
        ("high", "High"),
        ("medium", "Medium"),
        ("low", "Low"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="recs")
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES)
    title = models.CharField(max_length=255)
    description = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default="medium")
    action_url = models.URLField(blank=True, default="")
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["priority", "-created_at"]

    def __str__(self):
        return f"{self.category}: {self.title}"


class TechRecommendation(models.Model):
    """AI-generated technology learning recommendations for a user."""

    CATEGORY_CHOICES = [
        ("language", "Language"),
        ("framework", "Framework"),
        ("tool", "Tool"),
        ("cloud", "Cloud"),
        ("practice", "Practice"),
    ]

    PRIORITY_CHOICES = [
        ("high", "High"),
        ("medium", "Medium"),
        ("low", "Low"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tech_recs")
    technology = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    reason = models.TextField()
    learning_resources = models.JSONField(default=dict)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default="medium")
    career_impact = models.TextField(blank=True, default="")
    is_dismissed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["priority", "-created_at"]

    def __str__(self):
        return f"{self.technology}: {self.category}"
