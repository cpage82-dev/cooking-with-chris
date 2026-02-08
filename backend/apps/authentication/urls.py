"""
URL configuration for Authentication app.
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

app_name = 'authentication'

urlpatterns = [
    # Login (obtain JWT tokens)
    path('login/', views.CustomTokenObtainPairView.as_view(), name='login'),
    
    # Refresh access token
    path('refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    
    # Logout (blacklist refresh token)
    path('logout/', views.logout_view, name='logout'),
    
    # Password reset flow
    path('password-reset/', views.password_reset_request_view, name='password-reset'),
    path('password-reset-confirm/', views.password_reset_confirm_view, name='password-reset-confirm'),
]
