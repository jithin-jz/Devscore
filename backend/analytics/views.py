import time
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from github.tasks import fetch_repositories
from github.models import Repository


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def trigger_analysis(request):
    """
    Trigger the full analysis pipeline for the authenticated user.
    Pipeline: fetch repos → fetch metrics → analyze each repo → calculate score → generate recs → generate tech recs
    (Executed via a chain of background tasks)
    """
    profile = request.user.profile

    if profile.analysis_status in ("pending", "analyzing"):
        return Response(
            {"error": "Analysis is already in progress."},
            status=status.HTTP_409_CONFLICT,
        )

    profile.analysis_status = "pending"
    profile.save(update_fields=["analysis_status"])

    # Start the chain by calling the first task
    fetch_repositories(request.user.id)

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
