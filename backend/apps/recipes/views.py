"""
Views for Recipe-related API endpoints.

Provides:
- List recipes with search, filtering, and pagination
- Create new recipes
- Retrieve recipe details
- Update recipes (owner or admin only)
- Delete recipes (owner or admin only, soft delete)
"""

from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.db.models import Q, Case, When, Value, IntegerField
from .models import Recipe
from .serializers import (
    RecipeListSerializer,
    RecipeDetailSerializer,
    RecipeCreateUpdateSerializer,
)


class IsOwnerOrAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission:
    - Read operations: Anyone
    - Create: Authenticated users
    - Update/Delete: Recipe owner or admin only
    """
    
    def has_permission(self, request, view):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions require authentication
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for owner or admin
        if request.user and request.user.is_authenticated:
            return obj.user == request.user or request.user.is_admin
        
        return False


class RecipeListCreateView(generics.ListCreateAPIView):
    """
    API endpoint for listing and creating recipes.
    
    GET /api/v1/recipes/
        Returns paginated list of recipes
        Supports search by recipe name or ingredient name
        Supports filtering by course_type, recipe_type, protein, etc.
        Default pagination: 20 per page
    
    POST /api/v1/recipes/
        Creates new recipe (authenticated users only)
        Automatically sets current user as recipe creator
    
    Query Parameters:
        search: Search in recipe name and ingredient names
        course_type: Filter by course type
        recipe_type: Filter by recipe type
        primary_protein: Filter by primary protein
        ethnic_style: Filter by ethnic style
        uploaded_by: Filter by user ID who created recipe
        min_servings: Minimum number of servings (>=)
        time_needed: Filter by total time (e.g., "30", "60", "120", "121+")
        page: Page number for pagination
    """
    
    permission_classes = [IsOwnerOrAdminOrReadOnly]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'recipe_name', 'total_time']
    ordering = ['-created_at']  # Default ordering
    
    def get_serializer_class(self):
        """Use different serializers for list vs create."""
        if self.request.method == 'POST':
            return RecipeCreateUpdateSerializer
        return RecipeListSerializer
    
    def get_queryset(self):
        """
        Get filtered queryset based on query parameters.
        
        Always excludes soft-deleted recipes.
        Uses select_related and prefetch_related to avoid N+1 queries.
        """
        # Base queryset with optimizations to prevent N+1 queries
        queryset = Recipe.objects.filter(deleted=False).select_related('user').prefetch_related(
            'ingredient_sections__ingredients',
            'instruction_sections__instructions'
        )
        
        # Search functionality (FIXED: removed SQL injection vulnerability)
        search_query = self.request.query_params.get('search', '').strip()
        if search_query and len(search_query) >= 2:
            # Search in recipe name OR ingredient names
            queryset = queryset.filter(
                Q(recipe_name__icontains=search_query) |
                Q(ingredient_sections__ingredients__ingredient_name__icontains=search_query)
            ).distinct()
            
            # Priority ordering: recipe name matches first, then ingredient matches
            # Using Case/When to avoid SQL injection
            queryset = queryset.annotate(
                name_match=Case(
                    When(recipe_name__icontains=search_query, then=Value(0)),
                    default=Value(1),
                    output_field=IntegerField(),
                )
            ).order_by('name_match', '-created_at')
        
        # Filter by course type
        course_type = self.request.query_params.get('course_type')
        if course_type:
            queryset = queryset.filter(course_type=course_type)
        
        # Filter by recipe type
        recipe_type = self.request.query_params.get('recipe_type')
        if recipe_type:
            queryset = queryset.filter(recipe_type=recipe_type)
        
        # Filter by primary protein
        primary_protein = self.request.query_params.get('primary_protein')
        if primary_protein:
            queryset = queryset.filter(primary_protein=primary_protein)
        
        # Filter by ethnic style
        ethnic_style = self.request.query_params.get('ethnic_style')
        if ethnic_style:
            queryset = queryset.filter(ethnic_style=ethnic_style)
        
        # Filter by uploaded_by (user ID)
        uploaded_by = self.request.query_params.get('uploaded_by')
        if uploaded_by:
            try:
                queryset = queryset.filter(user_id=int(uploaded_by))
            except (ValueError, TypeError):
                pass
        
        # Filter by minimum servings
        min_servings = self.request.query_params.get('min_servings')
        if min_servings:
            try:
                servings = int(min_servings)
                if servings == 10:
                    # "10+" means >= 10
                    queryset = queryset.filter(number_servings__gte=10)
                else:
                    queryset = queryset.filter(number_servings__gte=servings)
            except (ValueError, TypeError):
                pass
        
        # Filter by time needed
        time_needed = self.request.query_params.get('time_needed')
        if time_needed:
            if time_needed == 'less_than_30':
                queryset = queryset.filter(total_time__lte=30)
            elif time_needed == '30_to_60':
                queryset = queryset.filter(total_time__gt=30, total_time__lte=60)
            elif time_needed == '60_to_120':
                queryset = queryset.filter(total_time__gt=60, total_time__lte=120)
            elif time_needed == 'more_than_120':
                queryset = queryset.filter(total_time__gt=120)
        
        return queryset
    
    def perform_create(self, serializer):
        """
        Save recipe with current user as creator.
        """
        serializer.save(user=self.request.user)


class RecipeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint for retrieving, updating, and deleting a recipe.
    
    GET /api/v1/recipes/:id/
        Returns complete recipe details with ingredients and instructions
    
    PUT /api/v1/recipes/:id/
        Updates recipe (owner or admin only)
    
    PATCH /api/v1/recipes/:id/
        Partially updates recipe (owner or admin only)
    
    DELETE /api/v1/recipes/:id/
        Soft deletes recipe (owner or admin only)
    """
    
    permission_classes = [IsOwnerOrAdminOrReadOnly]
    lookup_field = 'id'
    
    def get_serializer_class(self):
        """Use different serializers for retrieve vs update."""
        if self.request.method in ['PUT', 'PATCH']:
            return RecipeCreateUpdateSerializer
        return RecipeDetailSerializer
    
    def get_queryset(self):
        """
        Only return non-deleted recipes.
        Use prefetch_related to avoid N+1 queries when fetching ingredients and instructions.
        """
        return Recipe.objects.filter(deleted=False).select_related('user').prefetch_related(
            'ingredient_sections__ingredients',
            'instruction_sections__instructions',
        )
    
    def perform_destroy(self, instance):
        """
        Soft delete recipe instead of permanent deletion.
        
        Sets deleted=True and deleted_at timestamp.
        Recipe remains in database but is hidden from users.
        """
        from django.utils import timezone
        instance.deleted = True
        instance.deleted_at = timezone.now()
        instance.save()
    
    def destroy(self, request, *args, **kwargs):
        """
        Handle DELETE request with custom response.
        """
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {'message': 'Recipe deleted successfully.'},
            status=status.HTTP_200_OK
        )
