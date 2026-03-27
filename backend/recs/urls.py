from django.urls import path
from . import views

urlpatterns = [
    path("recs/", views.recs_list, name="recs-list"),
    path("recs/tech/", views.tech_recs_list, name="tech-recs-list"),
    path(
        "recs/tech/dismiss/<int:rec_id>/",
        views.tech_recs_dismiss,
        name="tech-recs-dismiss",
    ),
    path(
        "recs/tech/regenerate/", views.tech_recs_regenerate, name="tech-recs-regenerate"
    ),
]
