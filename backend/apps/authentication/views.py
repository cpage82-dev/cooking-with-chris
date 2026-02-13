"""
Authentication views for login, logout, and password reset.
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate
from django.utils import timezone
from django.utils.crypto import get_random_string
from datetime import timedelta
from apps.users.models import User, PasswordResetToken
from apps.users.serializers import UserSerializer
from django.core.mail import send_mail
from django.conf import settings


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom login view that returns user info along with tokens.
    """
    
    def post(self, request, *args, **kwargs):
        """
        Handle login request.
        
        Request body:
            {
                "email": "user@example.com",
                "password": "password123"
            }
        
        Response:
            {
                "access": "access_token",
                "refresh": "refresh_token",
                "user": {
                    "id": 1,
                    "email": "user@example.com",
                    "first_name": "John",
                    "last_name": "Doe",
                    "is_admin": false
                }
            }
        """
        # Normalize email to lowercase before authentication
        if 'email' in request.data:
            request.data['email'] = request.data['email'].lower().strip()
        
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # Get user info
            email = request.data.get('email', '')
            try:
                user = User.objects.get(email=email, deleted=False)
                user_serializer = UserSerializer(user)
                response.data['user'] = user_serializer.data
            except User.DoesNotExist:
                pass
        
        return response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Logout view that blacklists the refresh token.
    
    POST /api/v1/auth/logout/
        Request body:
            {
                "refresh": "refresh_token"
            }
        
        Response:
            {
                "message": "Logged out successfully"
            }
    """
    try:
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response(
                {'error': 'Refresh token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Blacklist the refresh token
        token = RefreshToken(refresh_token)
        token.blacklist()
        
        return Response(
            {'message': 'Logged out successfully'},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request_view(request):
    """
    Request password reset - sends email with reset link.
    """
    email = request.data.get('email', '').lower().strip()
    
    # Always return success message (don't reveal if email exists)
    success_message = "If an account exists with that email, you'll receive a reset link shortly."
    
    try:
        user = User.objects.get(email=email, deleted=False, is_active=True)
        
        # Rate limiting: max 3 requests per hour per email
        one_hour_ago = timezone.now() - timedelta(hours=1)
        recent_requests = PasswordResetToken.objects.filter(
            user=user,
            created_at__gte=one_hour_ago
        ).count()
        
        if recent_requests >= 3:
            # Still return success message but don't send email
            return Response(
                {'message': success_message},
                status=status.HTTP_200_OK
            )
        
        # Generate secure random token
        reset_token = get_random_string(64)
        
        # Create password reset token
        token_expiry = timezone.now() + timedelta(hours=1)
        PasswordResetToken.objects.create(
            user=user,
            token=reset_token,
            token_expiry=token_expiry
        )
        
        # Build reset URL
        frontend_url = settings.FRONTEND_URL
        reset_link = f"{frontend_url}/reset-password?token={reset_token}"
        
        # Send email via SendGrid
        subject = 'Reset Your Password - Cooking with Chris'
        message = f"""
Hello {user.get_full_name()},

You requested a password reset for your Cooking with Chris account.

Click the link below to reset your password:

{reset_link}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

Best regards,
Cooking with Chris Team
        """
        
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
        except Exception as e:
            # Log error but don't reveal to user
            print(f"Error sending password reset email: {e}")
        
    except User.DoesNotExist:
        # Don't reveal that user doesn't exist
        pass
    
    return Response(
        {'message': success_message},
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm_view(request):
    """
    Confirm password reset with token and new password.
    
    POST /api/v1/auth/password-reset-confirm/
        Request body:
            {
                "token": "reset_token_from_email",
                "new_password": "newpassword123",
                "confirm_password": "newpassword123"
            }
        
        Response:
            {
                "message": "Password reset successfully"
            }
    """
    token_string = request.data.get('token', '').strip()
    new_password = request.data.get('new_password', '')
    confirm_password = request.data.get('confirm_password', '')
    
    # Validate inputs
    if not token_string:
        return Response(
            {'error': 'Reset token is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not new_password:
        return Response(
            {'error': 'New password is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if len(new_password) < 8:
        return Response(
            {'error': 'Password must be at least 8 characters'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if new_password != confirm_password:
        return Response(
            {'error': 'Passwords do not match'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Find and validate token
    try:
        reset_token = PasswordResetToken.objects.get(token=token_string)
        
        if not reset_token.is_valid():
            if reset_token.used:
                error_message = 'This reset link has already been used.'
            else:
                error_message = 'This reset link has expired. Please request a new one.'
            
            return Response(
                {'error': error_message},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update user password
        user = reset_token.user
        user.set_password(new_password)
        user.save()
        
        # Mark token as used
        reset_token.mark_as_used()
        
        # TODO: Send confirmation email
        # Email: "Your password has been changed successfully"
        
        return Response(
            {'message': 'Password reset successfully'},
            status=status.HTTP_200_OK
        )
        
    except PasswordResetToken.DoesNotExist:
        return Response(
            {'error': 'This reset link is invalid. Please request a new one.'},
            status=status.HTTP_400_BAD_REQUEST
        )
