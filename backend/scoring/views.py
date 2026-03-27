from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import ScoreBreakdown, ScoreHistory
from .serializers import ScoreBreakdownSerializer, ScoreHistorySerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def score_detail(request):
    """Get current score breakdown for authenticated user."""
    try:
        breakdown = ScoreBreakdown.objects.get(user=request.user)
    except ScoreBreakdown.DoesNotExist:
        return Response(
            {
                "engineering_depth": 0,
                "collaboration": 0,
                "discipline": 0,
                "consistency": 0,
                "oss_impact": 0,
                "last_calculated": None,
            }
        )
    return Response(ScoreBreakdownSerializer(breakdown).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def score_history(request):
    """Get historical score entries for authenticated user."""
    history = ScoreHistory.objects.filter(user=request.user).only(
        "score", "breakdown_snapshot", "created_at"
    )[:50]
    return Response(ScoreHistorySerializer(history, many=True).data)
