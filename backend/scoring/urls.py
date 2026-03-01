from django.urls import path
from . import views

urlpatterns = [
    path("score/", views.score_detail, name="score-detail"),
    path("score/history/", views.score_history, name="score-history"),
]
