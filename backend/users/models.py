from django.contrib.auth.models import User
from django.db import models
from cryptography.fernet import Fernet
from django.conf import settings


def encrypt_token(token):
    """Encrypt a GitHub token using Fernet symmetric encryption."""
    if not token:
        return ""
    if not settings.FERNET_KEY:
        return token  # Fallback for dev without key
    f = Fernet(settings.FERNET_KEY.encode())
    return f.encrypt(token.encode()).decode()


def decrypt_token(encrypted_token):
    """Decrypt a GitHub token."""
    if not encrypted_token:
        return ""
    if not settings.FERNET_KEY:
        return encrypted_token
    f = Fernet(settings.FERNET_KEY.encode())
    return f.decrypt(encrypted_token.encode()).decode()


class DeveloperProfile(models.Model):
    """Extended user profile linked to GitHub identity."""

    TIER_CHOICES = [
        ("baseline", "Baseline"),
        ("proficient", "Proficient"),
        ("advanced", "Advanced"),
        ("architect", "Architect"),
        ("principal", "Principal"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    github_username = models.CharField(max_length=255, unique=True, db_index=True)
    avatar_url = models.URLField(max_length=500, blank=True, default="")
    github_token_encrypted = models.TextField(blank=True, default="")
    bio = models.TextField(blank=True, default="")
    dev_score = models.FloatField(default=0.0, db_index=True)
    tier = models.CharField(max_length=20, choices=TIER_CHOICES, default="baseline")
    analysis_status = models.CharField(
        max_length=20,
        choices=[
            ("idle", "Idle"),
            ("pending", "Pending"),
            ("analyzing", "Analyzing"),
            ("complete", "Complete"),
            ("failed", "Failed"),
        ],
        default="idle",
        db_index=True,
    )
    last_analyzed = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def set_github_token(self, token):
        self.github_token_encrypted = encrypt_token(token)

    def get_github_token(self):
        return decrypt_token(self.github_token_encrypted)

    @staticmethod
    def compute_tier(score):
        if score >= 91:
            return "principal"
        elif score >= 76:
            return "architect"
        elif score >= 56:
            return "advanced"
        elif score >= 31:
            return "proficient"
        return "baseline"

    def __str__(self):
        return f"{self.github_username} ({self.tier} — {self.dev_score})"

    class Meta:
        ordering = ["-dev_score"]
