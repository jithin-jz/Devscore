from django.urls import path
from . import views

urlpatterns = [
    path("me/", views.me, name="me"),
    path("delete-account/", views.delete_account, name="delete-account"),
    path("admin/login/", views.admin_login, name="admin-login"),
    path("admin/stats/", views.admin_stats, name="admin-stats"),
    path("admin/users/<int:user_id>/", views.admin_delete_user, name="admin-delete-user"),
]
