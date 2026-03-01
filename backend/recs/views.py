from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Recommendation
from .serializers import RecommendationSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def recs_list(request):
    """Get current recs for authenticated user."""
    recs = Recommendation.objects.filter(user=request.user, is_resolved=False)
    return Response(RecommendationSerializer(recs, many=True).data)
