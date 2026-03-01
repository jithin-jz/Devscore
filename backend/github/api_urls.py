from django.urls import path
from . import views

urlpatterns = [
    path("repositories/", views.list_repositories, name="list-repositories"),
    path("repositories/<int:repo_id>/audit/", views.audit_repository, name="audit-repository"),
]
