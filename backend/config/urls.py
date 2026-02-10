"""
URL configuration for Cooking with Chris project.
"""

from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    path('nested_admin/', include('nested_admin.urls')),
    
    # API v1
    path('api/v1/', include([
        path('auth/', include('apps.authentication.urls')),
        path('recipes/', include('apps.recipes.urls')),
        path('users/', include('apps.users.urls')),
    ])),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
