from django.db import models
from django.contrib.auth.models import User


class ScoreBreakdown(models.Model):
    """Individual category scores for a user."""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="score_breakdown")
    engineering_depth = models.FloatField(default=0.0)
    collaboration = models.FloatField(default=0.0)
    discipline = models.FloatField(default=0.0)
    consistency = models.FloatField(default=0.0)
    oss_impact = models.FloatField(default=0.0)
    last_calculated = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def to_dict(self):
        return {
            "engineering_depth": round(self.engineering_depth, 1),
            "collaboration": round(self.collaboration, 1),
            "discipline": round(self.discipline, 1),
            "consistency": round(self.consistency, 1),
            "oss_impact": round(self.oss_impact, 1),
        }

    def __str__(self):
        return f"Scores for {self.user.username}"


class ScoreHistory(models.Model):
    """Historical score snapshots for trend tracking."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="score_history")
    score = models.FloatField()
    breakdown_snapshot = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "Score History"

    def __str__(self):
        return f"{self.user.username}: {self.score} @ {self.created_at}"


class ScoringConfig(models.Model):
    """Singleton model for admin-configurable scoring weights."""

    weight_engineering = models.FloatField(default=0.30)
    weight_discipline = models.FloatField(default=0.20)
    weight_collaboration = models.FloatField(default=0.20)
    weight_consistency = models.FloatField(default=0.20)
    weight_oss = models.FloatField(default=0.10)

    class Meta:
        verbose_name = "Scoring Configuration"
        verbose_name_plural = "Scoring Configuration"

    def save(self, *args, **kwargs):
        # Enforce singleton
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get_weights(cls):
        config, _ = cls.objects.get_or_create(pk=1)
        return {
            "engineering_depth": config.weight_engineering,
            "discipline": config.weight_discipline,
            "collaboration": config.weight_collaboration,
            "consistency": config.weight_consistency,
            "oss_impact": config.weight_oss,
        }

    def __str__(self):
        return "Scoring Weights Configuration"
