import time
from celery import chain, shared_task
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from github.tasks import fetch_repositories, fetch_contribution_metrics, analyze_repository
from scoring.tasks import calculate_score
from recs.tasks import generate_recs, generate_tech_recs_task
from github.models import Repository


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def trigger_analysis(request):
    """
    Trigger the full analysis pipeline for the authenticated user.
    Pipeline: fetch repos → analyze each repo → fetch metrics → calculate score → generate recs → generate tech recs
    """
    profile = request.user.profile

    if profile.analysis_status in ("pending", "analyzing"):
        return Response(
            {"error": "Analysis is already in progress."},
            status=status.HTTP_409_CONFLICT,
        )

    profile.analysis_status = "pending"
    profile.save(update_fields=["analysis_status"])

    # Chain: fetch repos → then fan out to analyze each, then score + recs + tech recs
    chain(
        fetch_repositories.s(request.user.id),
        fetch_contribution_metrics.si(request.user.id),
        _analyze_all_repos.si(request.user.id),
        calculate_score.si(request.user.id),
        generate_recs.si(request.user.id),
        generate_tech_recs_task.si(request.user.id),
    ).apply_async()

    return Response({"status": "Analysis pipeline started."})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def analysis_status(request):
    """Get the current analysis pipeline status."""
    profile = request.user.profile
    return Response(
        {
            "status": profile.analysis_status,
            "last_analyzed": profile.last_analyzed,
        }
    )

@shared_task
def _analyze_all_repos(user_id):
    """Analyze all repos for a user (called as part of the pipeline chain)."""
    repos = Repository.objects.filter(user_id=user_id)
    for repo in repos:
        analyze_repository.delay(repo.id)
    # Small delay to let analysis finish before scoring
    time.sleep(min(len(repos) * 2, 30))
    return {"user_id": user_id, "repos_queued": repos.count()}
