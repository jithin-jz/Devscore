from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Repository
from .serializers import RepositorySerializer
from .tasks import deep_audit_repository


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_repositories(request):
    """List all repositories for the authenticated user."""
    repos = Repository.objects.filter(user=request.user)
    serializer = RepositorySerializer(repos, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def audit_repository(request, repo_id):
    """Trigger a deep AI audit for a specific repository."""
    try:
        repo = Repository.objects.get(id=repo_id, user=request.user)
    except Repository.DoesNotExist:
        return Response({"error": "Repository not found."}, status=status.HTTP_404_NOT_FOUND)

    deep_audit_repository.delay(repo.id)
    return Response({"status": "Audit pipeline started."})
