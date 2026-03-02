import logging
from datetime import datetime, timezone

from background_task import background
from django.contrib.auth.models import User

from .models import Repository, ContributionMetrics
from .github_client import GitHubClient

logger = logging.getLogger(__name__)


@background(schedule=0)
def fetch_repositories(user_id):
    """Fetch all repositories for a user from GitHub and upsert into DB."""
    try:
        user = User.objects.get(id=user_id)
        profile = user.profile
        profile.analysis_status = "analyzing"
        profile.save(update_fields=["analysis_status"])

        client = GitHubClient(profile.get_github_token())
        repos = client.get_user_repos()

        if repos is None:
            raise Exception("Failed to fetch repositories from GitHub")

        for repo_data in repos:
            if repo_data.get("private"):
                continue

            repo_created = repo_data.get("created_at")
            repo_updated = repo_data.get("updated_at")

            Repository.objects.update_or_create(
                user=user,
                full_name=repo_data["full_name"],
                defaults={
                    "name": repo_data["name"],
                    "description": repo_data.get("description") or "",
                    "primary_language": repo_data.get("language") or "",
                    "stars": repo_data.get("stargazers_count", 0),
                    "forks": repo_data.get("forks_count", 0),
                    "is_fork": repo_data.get("fork", False),
                    "size_kb": repo_data.get("size", 0),
                    "open_issues_count": repo_data.get("open_issues_count", 0),
                    "repo_created_at": repo_created,
                    "repo_updated_at": repo_updated,
                },
            )

        logger.info(f"Fetched {len(repos)} repos for {user.username}")
        
        # Trigger next step: fetch contribution metrics
        from .tasks import fetch_contribution_metrics
        fetch_contribution_metrics(user_id)

    except Exception as exc:
        logger.error(f"Error fetching repos for user {user_id}: {exc}")
        raise exc


@background(schedule=0)
def fetch_contribution_metrics(user_id):
    """Aggregate contribution metrics from GitHub events API."""
    try:
        user = User.objects.get(id=user_id)
        client = GitHubClient(user.profile.get_github_token())
        events = client.get_user_events(user.username)

        if events is None:
            events = []

        commits = 0
        pr_opened = 0
        pr_merged = 0
        issues_opened = 0
        issues_closed = 0
        external = 0
        active_dates = set()
        user_repos = set(Repository.objects.filter(user=user).values_list("full_name", flat=True))

        for event in events:
            event_type = event.get("type")
            created = event.get("created_at", "")[:10]
            if created:
                active_dates.add(created)

            repo_name = event.get("repo", {}).get("name", "")

            if event_type == "PushEvent":
                payload = event.get("payload", {})
                commits += payload.get("size", 0)
            elif event_type == "PullRequestEvent":
                action = event.get("payload", {}).get("action")
                if action == "opened":
                    pr_opened += 1
                    if repo_name not in user_repos:
                        external += 1
                elif action == "closed" and event.get("payload", {}).get("pull_request", {}).get("merged"):
                    pr_merged += 1
            elif event_type == "IssuesEvent":
                action = event.get("payload", {}).get("action")
                if action == "opened":
                    issues_opened += 1
                elif action == "closed":
                    issues_closed += 1

        # Calculate streak
        sorted_dates = sorted(active_dates)
        max_streak = 0
        current_streak = 1
        for i in range(1, len(sorted_dates)):
            d1 = datetime.strptime(sorted_dates[i - 1], "%Y-%m-%d")
            d2 = datetime.strptime(sorted_dates[i], "%Y-%m-%d")
            if (d2 - d1).days == 1:
                current_streak += 1
            else:
                max_streak = max(max_streak, current_streak)
                current_streak = 1
        max_streak = max(max_streak, current_streak) if sorted_dates else 0

        metrics, _ = ContributionMetrics.objects.update_or_create(
            user=user,
            defaults={
                "total_commits": commits,
                "pr_opened": pr_opened,
                "pr_merged": pr_merged,
                "issues_opened": issues_opened,
                "issues_closed": issues_closed,
                "external_contributions": external,
                "active_days": len(active_dates),
                "streak_max": max_streak,
                "last_fetched": datetime.now(timezone.utc),
            },
        )

        logger.info(f"Fetched contribution metrics for {user.username}")
        
        # Trigger next step: analyze all repos
        from .tasks import analyze_all_repos_task
        analyze_all_repos_task(user_id)

    except Exception as exc:
        logger.error(f"Error fetching metrics for user {user_id}: {exc}")
        raise exc


@background(schedule=0)
def analyze_all_repos_task(user_id):
    """Analyze all repositories for a user synchronously in the background."""
    try:
        repos = Repository.objects.filter(user_id=user_id)
        for repo in repos:
            # We can run the analysis logic directly here to ensure it finishes before scoring
            _perform_repo_analysis(repo.id)
        
        # Trigger next step: scoring
        from scoring.tasks import calculate_user_score
        calculate_user_score(user_id)
        
    except Exception as exc:
        logger.error(f"Error in analyze_all_repos_task for user {user_id}: {exc}")
        raise exc


def _perform_repo_analysis(repo_id):
    """Internal helper to analyze a repo (replaces the shared_task version for synchronous call)."""
    try:
        repo = Repository.objects.select_related("user__profile").get(id=repo_id)
        client = GitHubClient(repo.user.profile.get_github_token())

        features = client.detect_repo_features(repo.full_name)

        repo.has_ci = features["has_ci"]
        repo.has_tests = features["has_tests"]
        repo.has_docker = features["has_docker"]
        repo.has_lint = features["has_lint"]
        repo.has_types = features["has_types"]
        repo.analyzed_at = datetime.now(timezone.utc)
        repo.save()

        logger.info(f"Analyzed repo {repo.full_name}")

    except Exception as exc:
        logger.error(f"Error analyzing repo {repo_id}: {exc}")


@background(schedule=0)
def analyze_repository(repo_id):
    """Keep this for direct calls if needed, but it uses the helper now."""
    _perform_repo_analysis(repo_id)


@background(schedule=0)
def deep_audit_repository(repo_id):
    """Perform a deep AI audit of a specific repository."""
    from .models import Repository, RepositoryAudit
    from analytics.auditor import perform_deep_audit

    try:
        repo = Repository.objects.select_related("user__profile").get(id=repo_id)
        token = repo.user.profile.get_github_token()

        audit_data = perform_deep_audit(repo, token)
        if audit_data:
            RepositoryAudit.objects.update_or_create(
                repository=repo,
                defaults={
                    "summary": audit_data.get("summary", ""),
                    "strengths": audit_data.get("strengths", []),
                    "weaknesses": audit_data.get("weaknesses", []),
                    "suggestions": audit_data.get("suggestions", []),
                    "architecture_score": audit_data.get("architecture_score", 0),
                },
            )
            logger.info(f"Completed deep audit for {repo.full_name}")

    except Exception as exc:
        logger.error(f"Error auditing repo {repo_id}: {exc}")
        raise exc
