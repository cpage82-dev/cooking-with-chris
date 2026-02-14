"""
URL configuration for Recipes app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'recipes'

# Router for ViewSets
router = DefaultRouter()
router.register(r'comments', views.CommentViewSet, basename='comment')

urlpatterns = [
    # List all recipes and create new recipe
    path('', views.RecipeListCreateView.as_view(), name='recipe-list-create'),
    
    # Retrieve, update, and delete specific recipe
    path('<int:id>/', views.RecipeDetailView.as_view(), name='recipe-detail'),
    
    # Comment endpoints
    path('', include(router.urls)),
]