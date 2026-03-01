from django.urls import path
from . import views

urlpatterns = [
    path("analyze/", views.trigger_analysis, name="trigger-analysis"),
    path("analysis/status/", views.analysis_status, name="analysis-status"),
]
