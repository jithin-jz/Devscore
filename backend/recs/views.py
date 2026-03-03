from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Recommendation, TechRecommendation
from .serializers import RecommendationSerializer, TechRecommendationSerializer
from .tasks import generate_tech_recs_task


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def recs_list(request):
    """Get current recs for authenticated user."""
    recs = Recommendation.objects.filter(user=request.user, is_resolved=False)
    return Response(RecommendationSerializer(recs, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def tech_recs_list(request):
    """Get current tech recommendations for authenticated user."""
    recs = TechRecommendation.objects.filter(user=request.user, is_dismissed=False)
    return Response(TechRecommendationSerializer(recs, many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def tech_recs_dismiss(request, rec_id):
    """Dismiss a tech recommendation."""
    try:
        rec = TechRecommendation.objects.get(id=rec_id, user=request.user)
        rec.is_dismissed = True
        rec.save()
        return Response({"status": "dismissed"})
    except TechRecommendation.DoesNotExist:
        return Response({"error": "Not found"}, status=404)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def tech_recs_regenerate(request):
    """Manually regenerate tech recommendations."""
    generate_tech_recs_task(request.user.id)
    return Response({"status": "regeneration started"})
