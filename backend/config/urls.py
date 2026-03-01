from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("auth/", include("users.urls")),
    path("api/", include("users.api_urls")),
    path("api/", include("scoring.urls")),
    path("api/", include("recs.urls")),
    path("api/", include("analytics.urls")),
    path("api/github/", include("github.api_urls")),
    path("badge/", include("badges.urls")),
]
