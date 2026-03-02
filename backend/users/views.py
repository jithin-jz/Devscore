import requests as http_requests
from django.conf import settings
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import DeveloperProfile
from .serializers import ProfileSerializer


@api_view(["POST"])
@permission_classes([AllowAny])
def github_login(request):
    """
    Exchange a GitHub OAuth code for a DRF token.
    Frontend sends { "code": "<github_oauth_code>" }
    """
    code = request.data.get("code")
    if not code:
        return Response({"error": "GitHub OAuth code is required."}, status=status.HTTP_400_BAD_REQUEST)

    # Exchange code for access token
    token_response = http_requests.post(
        "https://github.com/login/oauth/access_token",
        data={
            "client_id": settings.GITHUB_CLIENT_ID,
            "client_secret": settings.GITHUB_CLIENT_SECRET,
            "code": code,
        },
        headers={"Accept": "application/json"},
        timeout=10,
    )

    if token_response.status_code != 200:
        return Response({"error": "Failed to exchange code with GitHub."}, status=status.HTTP_502_BAD_GATEWAY)

    token_data = token_response.json()
    access_token = token_data.get("access_token")

    if not access_token:
        gh_error = token_data.get("error_description", token_data.get("error", "Failed to obtain access token."))
        return Response(
            {"error": f"GitHub OAuth error: {gh_error}"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Fetch GitHub user info
    user_response = http_requests.get(
        "https://api.github.com/user",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/vnd.github.v3+json",
        },
        timeout=10,
    )

    if user_response.status_code != 200:
        return Response({"error": "Failed to fetch GitHub user info."}, status=status.HTTP_502_BAD_GATEWAY)

    github_user = user_response.json()
    github_username = github_user.get("login")
    avatar_url = github_user.get("avatar_url", "")
    email = github_user.get("email", "")
    bio = github_user.get("bio", "") or ""

    try:
        # Create or update Django user + profile
        user, created = User.objects.get_or_create(
            username=github_username,
            defaults={"email": email or f"{github_username}@github.local"},
        )

        if not created and email:
            user.email = email
            user.save(update_fields=["email"])

        profile, _ = DeveloperProfile.objects.get_or_create(
            user=user,
            defaults={"github_username": github_username},
        )
        profile.avatar_url = avatar_url
        profile.bio = bio
        profile.github_username = github_username
        profile.set_github_token(access_token)
        profile.save()

        # Generate DRF auth token
        drf_token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {
                "token": drf_token.key,
                "user": ProfileSerializer(profile).data,
            }
        )
    except Exception as e:
        import traceback
        error_msg = f"Internal server error: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        return Response(
            {"error": error_msg},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    """Return authenticated user's profile."""
    try:
        profile = request.user.profile
    except DeveloperProfile.DoesNotExist:
        return Response({"error": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)
    return Response(ProfileSerializer(profile).data)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_account(request):
    """Permanently delete user account and associated data."""
    user = request.user
    user.delete()  # Cascade will handle all related data automatically
    return Response(
        {"message": "Account and all associated data deleted successfully."}, status=status.HTTP_204_NO_CONTENT
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def admin_login(request):
    """Standard username/password login for admins."""
    from django.contrib.auth import authenticate

    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)
    if not user or not user.is_superuser:
        return Response({"error": "Invalid admin credentials."}, status=status.HTTP_401_UNAUTHORIZED)

    # Ensure admin has a profile
    profile, _ = DeveloperProfile.objects.get_or_create(
        user=user, defaults={"github_username": "Admin", "tier": "principal"}
    )

    drf_token, _ = Token.objects.get_or_create(user=user)

    return Response(
        {
            "token": drf_token.key,
            "user": ProfileSerializer(profile).data,
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_stats(request):
    """Get system stats for the admin dashboard."""
    if not request.user.is_superuser:
        return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

    users = DeveloperProfile.objects.all().order_by("-created_at")

    total_users = users.count()
    avg_score = sum(u.dev_score for u in users if u.dev_score) / total_users if total_users > 0 else 0
    total_analyses = sum(1 for u in users if u.analysis_status == "complete")

    users_data = ProfileSerializer(users, many=True).data

    return Response(
        {
            "total_users": total_users,
            "avg_score": round(avg_score, 1),
            "total_analyses": total_analyses,
            "recent_users": users_data[:50],
        }
    )


@api_view(["DELETE", "GET"])
@permission_classes([IsAuthenticated])
def admin_delete_user(request, user_id):
    """Admin endpoint to fetch or delete a specific user by their ID."""
    if not request.user.is_superuser:
        return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

    try:
        profile = DeveloperProfile.objects.get(id=user_id)

        if request.method == "GET":
            from scoring.models import ScoreBreakdown, ScoreHistory
            from scoring.serializers import ScoreBreakdownSerializer, ScoreHistorySerializer
            from recs.models import Recommendation
            from recs.serializers import RecommendationSerializer

            target_user = profile.user

            # Get Score Breakdown
            try:
                score_data = ScoreBreakdownSerializer(target_user.score_breakdown).data
                score_data["dev_score"] = profile.dev_score
                score_data["tier"] = profile.tier
            except ScoreBreakdown.DoesNotExist:
                score_data = None

            # Get Score History
            history = ScoreHistory.objects.filter(user=target_user)
            history_data = ScoreHistorySerializer(history, many=True).data

            # Get Recommendations
            recs = Recommendation.objects.filter(user=target_user)
            recs_data = RecommendationSerializer(recs, many=True).data

            # Return aggregated info
            return Response(
                {
                    "profile": ProfileSerializer(profile).data,
                    "score": score_data,
                    "history": history_data,
                    "recs": recs_data,
                }
            )

        elif request.method == "DELETE":
            if profile.user.is_superuser:
                return Response({"error": "Cannot delete an admin user."}, status=status.HTTP_400_BAD_REQUEST)

            profile.user.delete()
            return Response({"message": "User deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

    except DeveloperProfile.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
