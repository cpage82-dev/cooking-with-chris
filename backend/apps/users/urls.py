"""
URL configuration for Users app.
"""

from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    # Current user profile (view, update, delete)
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    
    # Get current authenticated user
    path('me/', views.current_user_view, name='current-user'),
    
    # Get users with recipes (for filter dropdown)
    path('with-recipes/', views.users_with_recipes_view, name='users-with-recipes'),
]
