from django.urls import path
from . import views

urlpatterns = [
    path("recs/", views.recs_list, name="recs-list"),
]
