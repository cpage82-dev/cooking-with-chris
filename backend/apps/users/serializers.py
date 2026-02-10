"""
Serializers for User model and related operations.
"""

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model.
    
    Used for displaying user information (excluding password).
    """
    
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'is_admin',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_full_name(self, obj):
        """Return user's full name."""
        return obj.get_full_name()


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile operations.
    
    Allows users to view and update their own profile.
    Includes optional password change functionality.
    """
    
    new_password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        style={'input_type': 'password'},
        help_text="New password (optional, min 8 characters)"
    )
    confirm_password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        style={'input_type': 'password'},
        help_text="Confirm new password"
    )
    
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'created_at',
            'updated_at',
            'new_password',
            'confirm_password',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_first_name(self, value):
        """
        Validate first name.
        
        Rules:
        - Required
        - 2-50 characters
        - Letters, spaces, hyphens, apostrophes only
        """
        if len(value) < 2:
            raise serializers.ValidationError(
                "First name must be at least 2 characters."
            )
        if len(value) > 50:
            raise serializers.ValidationError(
                "First name must be 50 characters or less."
            )
        return value.strip()
    
    def validate_last_name(self, value):
        """
        Validate last name.
        
        Rules:
        - Required
        - 2-50 characters
        - Letters, spaces, hyphens, apostrophes only
        """
        if len(value) < 2:
            raise serializers.ValidationError(
                "Last name must be at least 2 characters."
            )
        if len(value) > 50:
            raise serializers.ValidationError(
                "Last name must be 50 characters or less."
            )
        return value.strip()
    
    def validate_email(self, value):
        """
        Validate email uniqueness.
        
        Check if email is already in use by another user.
        """
        # Normalize email to lowercase
        value = value.lower().strip()
        
        # Check if email is already taken by another user
        user = self.instance
        if User.objects.filter(email=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError(
                "This email address is already in use."
            )
        
        return value
    
    def validate(self, data):
        """
        Validate password fields if provided.
        
        Rules:
        - If one password field is filled, both must be filled
        - Passwords must match
        - Password must meet Django's validation requirements
        """
        new_password = data.get('new_password', '').strip()
        confirm_password = data.get('confirm_password', '').strip()
        
        # Check if passwords are provided
        if new_password or confirm_password:
            # Both fields must be provided if one is
            if not new_password:
                raise serializers.ValidationError({
                    'new_password': 'Please enter a new password.'
                })
            if not confirm_password:
                raise serializers.ValidationError({
                    'confirm_password': 'Please confirm your new password.'
                })
            
            # Passwords must match
            if new_password != confirm_password:
                raise serializers.ValidationError({
                    'confirm_password': 'Passwords do not match.'
                })
            
            # Validate password strength
            try:
                validate_password(new_password, self.instance)
            except ValidationError as e:
                raise serializers.ValidationError({
                    'new_password': list(e.messages)
                })
        
        return data
    
    def update(self, instance, validated_data):
        """
        Update user profile.
        
        Handles password change if new_password is provided.
        """
        # Remove password fields from validated_data
        new_password = validated_data.pop('new_password', None)
        validated_data.pop('confirm_password', None)
        
        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Update password if provided
        if new_password:
            instance.set_password(new_password)
        
        instance.save()
        return instance


class UserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new users.
    
    Used for user registration (will be disabled later - admins create users manually).
    """
    
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        help_text="User password (min 8 characters)"
    )
    
    class Meta:
        model = User
        fields = [
            'email',
            'first_name',
            'last_name',
            'password',
        ]
    
    def validate_email(self, value):
        """
        Validate email is unique (case-insensitive).
        """
        email = value.lower().strip()
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )
        return email
    
    def validate_password(self, value):
        """Validate password strength."""
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value
    
    def create(self, validated_data):
        """Create new user with hashed password."""
        # Normalize email to lowercase
        validated_data['email'] = validated_data['email'].lower().strip()
        
        password = validated_data.pop('password')
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        return user


class UserListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for listing users.
    
    Used in recipe filters and user dropdowns.
    """
    
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'full_name']
    
    def get_full_name(self, obj):
        """Return user's full name."""
        return obj.get_full_name()