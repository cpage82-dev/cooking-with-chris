"""
Views for Recipe-related API endpoints.

Provides:
- List recipes with search, filtering, and pagination
- Create new recipes
- Retrieve recipe details
- Update recipes (owner or admin only)
- Delete recipes (owner or admin only, soft delete)
"""
import json
from urllib import request

from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.db.models import Q, Case, When, Value, IntegerField
from uritemplate import partial
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
    """
    
    permission_classes = [IsOwnerOrAdminOrReadOnly]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'recipe_name', 'total_time']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Use different serializers for list vs create."""
        if self.request.method == 'POST':
            return RecipeCreateUpdateSerializer
        return RecipeListSerializer
    
    def get_queryset(self):
        """Get filtered queryset based on query parameters."""
        queryset = Recipe.objects.filter(deleted=False).select_related('user').prefetch_related(
            'ingredient_sections__ingredients',
            'instruction_sections__instructions'
        )
        
        # Search functionality
        search_query = self.request.query_params.get('search', '').strip()
        if search_query and len(search_query) >= 2:
            queryset = queryset.filter(
                Q(recipe_name__icontains=search_query) |
                Q(ingredient_sections__ingredients__ingredient_name__icontains=search_query)
            ).distinct()
            
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
        
        # Filter by uploaded_by
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
    
    def create(self, request, *args, **kwargs):
        """
        Override create to handle multipart/form-data with JSON fields.
        """
        # Create a regular dict from request.data
        data = {}
        
        # Copy all fields from request.data
        for key in request.data.keys():
            data[key] = request.data[key]
        
        # DEBUG: Print what we received
        print("=" * 80)
        print("RECEIVED DATA KEYS:", data.keys())
        for key, value in data.items():
            if isinstance(value, (str, int)):
                print(f"{key}: {type(value)} = {value}")
            else:
                print(f"{key}: {type(value)} = [FILE or COMPLEX DATA]")
        print("=" * 80)
        
        # Parse JSON strings for nested sections
        if 'ingredient_sections' in data and isinstance(data['ingredient_sections'], str):
            try:
                data['ingredient_sections'] = json.loads(data['ingredient_sections'])
                print("PARSED ingredient_sections successfully")
            except json.JSONDecodeError as e:
                print(f"JSON DECODE ERROR (ingredients): {e}")
                return Response(
                    {'ingredient_sections': f'Invalid JSON format: {str(e)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        if 'instruction_sections' in data and isinstance(data['instruction_sections'], str):
            try:
                data['instruction_sections'] = json.loads(data['instruction_sections'])
                print("PARSED instruction_sections successfully")
            except json.JSONDecodeError as e:
                print(f"JSON DECODE ERROR (instructions): {e}")
                return Response(
                    {'instruction_sections': f'Invalid JSON format: {str(e)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Create serializer with parsed data
        serializer = self.get_serializer(data=data)
        
        # Check validation
        if not serializer.is_valid():
            print("VALIDATION ERRORS:")
            print(serializer.errors)
            print("=" * 80)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Save with current user
        self.perform_create(serializer)
        
        # Return created recipe
        recipe = serializer.instance
        detail_serializer = RecipeDetailSerializer(recipe)
        headers = self.get_success_headers(detail_serializer.data)
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def perform_create(self, serializer):
        """Save recipe with current user as creator."""
        serializer.save(user=self.request.user)


class RecipeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint for retrieving, updating, and deleting a recipe.
    """
    
    permission_classes = [IsOwnerOrAdminOrReadOnly]
    lookup_field = 'id'
    
    def get_serializer_class(self):
        """Use different serializers for retrieve vs update."""
        if self.request.method in ['PUT', 'PATCH']:
            return RecipeCreateUpdateSerializer
        return RecipeDetailSerializer
    
    def get_queryset(self):
        """Only return non-deleted recipes."""
        return Recipe.objects.filter(deleted=False).select_related('user').prefetch_related(
            'ingredient_sections__ingredients',
            'instruction_sections__instructions',
        )
    
    def perform_destroy(self, instance):
        """Soft delete recipe."""
        from django.utils import timezone
        instance.deleted = True
        instance.deleted_at = timezone.now()
        instance.save()
    
    def destroy(self, request, *args, **kwargs):
        """Handle DELETE request."""
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {'message': 'Recipe deleted successfully.'},
            status=status.HTTP_200_OK
        )
    
    def update(self, request, *args, **kwargs):
        """
        Override update to handle multipart/form-data with JSON fields.
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
    
        # Create a regular dict from request.data
        data = {}
        for key in request.data.keys():
            data[key] = request.data[key]
    
        # Parse JSON strings for nested sections if they exist
        if 'ingredient_sections' in data and isinstance(data['ingredient_sections'], str):
            try:
                data['ingredient_sections'] = json.loads(data['ingredient_sections'])
            except json.JSONDecodeError as e:
                return Response(
                    {'ingredient_sections': f'Invalid JSON format: {str(e)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
    
        if 'instruction_sections' in data and isinstance(data['instruction_sections'], str):
            try:
                data['instruction_sections'] = json.loads(data['instruction_sections'])
            except json.JSONDecodeError as e:
                return Response(
                    {'instruction_sections': f'Invalid JSON format: {str(e)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
    
        # Use serializer to validate and update
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
    
        # Return updated recipe using detail serializer
        detail_serializer = RecipeDetailSerializer(serializer.instance)
        return Response(detail_serializer.data)