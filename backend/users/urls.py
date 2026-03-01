from django.urls import path
from . import views

urlpatterns = [
    path("github/login/", views.github_login, name="github-login"),
]
