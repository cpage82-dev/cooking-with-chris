"""
URL configuration for Recipes app.
"""

from django.urls import path
from . import views

app_name = 'recipes'

urlpatterns = [
    # List all recipes and create new recipe
    path('', views.RecipeListCreateView.as_view(), name='recipe-list-create'),
    
    # Retrieve, update, and delete specific recipe
    path('<int:id>/', views.RecipeDetailView.as_view(), name='recipe-detail'),
]
