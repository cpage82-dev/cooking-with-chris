"""
Views for User-related API endpoints.
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from .models import User
from .serializers import UserProfileSerializer, UserSerializer, UserCreateSerializer


class UserProfileView(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint for viewing, updating, and deleting user profile.
    
    GET /api/v1/users/profile/
        Returns current user's profile information
    
    PUT /api/v1/users/profile/
        Updates current user's profile
        Supports optional password change via new_password/confirm_password
    
    DELETE /api/v1/users/profile/
        Soft deletes current user's account
        User's recipes remain but display "Anonymous User"
    """
    
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        """
        Return the current authenticated user.
        """
        return self.request.user
    
    def perform_destroy(self, instance):
        """
        Soft delete user account.
        
        Instead of permanently deleting, set deleted=True.
        User can no longer log in.
        User's recipes remain but show "Anonymous User".
        """
        instance.soft_delete()
    
    def destroy(self, request, *args, **kwargs):
        """
        Handle DELETE request with custom response.
        """
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {'message': 'Your account has been deleted successfully.'},
            status=status.HTTP_200_OK
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def current_user_view(request):
    """
    API endpoint to get current authenticated user's information.
    
    GET /api/v1/users/me/
        Returns current user's basic information
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def users_with_recipes_view(request):
    """
    API endpoint to get list of users who have created recipes.
    
    GET /api/v1/users/with-recipes/
        Returns list of users who have at least one non-deleted recipe
        Used for the "Uploaded By" filter dropdown
    
    Response format:
        [
            {
                "id": 1,
                "first_name": "Chris",
                "last_name": "Thompson",
                "full_name": "Chris Thompson"
            },
            ...
        ]
    """
    from .serializers import UserListSerializer
    
    # Get users who have created at least one non-deleted recipe
    users = User.objects.filter(
        recipes__deleted=False,
        deleted=False
    ).distinct().order_by('last_name', 'first_name')
    
    serializer = UserListSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Register a new user.
    
    POST /api/v1/users/
        Request body:
            {
                "email": "user@example.com",
                "password": "password123",
                "first_name": "John",
                "last_name": "Doe"
            }
        
        Response:
            {
                "id": 1,
                "email": "user@example.com",
                "first_name": "John",
                "last_name": "Doe",
                "is_admin": false
            }
    """
    serializer = UserCreateSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED
        )
    
    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )
