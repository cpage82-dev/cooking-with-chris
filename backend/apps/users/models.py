"""
User model for Cooking with Chris application.

This custom user model extends Django's AbstractBaseUser and PermissionsMixin
to provide email-based authentication and additional user fields.
"""

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    """
    Custom user manager for email-based authentication.
    """
    
    def create_user(self, email, password=None, **extra_fields):
        """
        Create and save a regular user with the given email and password.
        
        Args:
            email: User's email address (used as username)
            password: User's password
            **extra_fields: Additional fields like first_name, last_name
            
        Returns:
            User: Created user instance
        """
        if not email:
            raise ValueError('Users must have an email address')
        
        # Normalize email: lowercase and strip whitespace
        email = self.normalize_email(email).lower().strip()
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """
        Create and save a superuser with the given email and password.
        
        Args:
            email: Admin email address
            password: Admin password
            **extra_fields: Additional fields
            
        Returns:
            User: Created superuser instance
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_admin', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model with email as the primary identifier.
    
    Fields:
        email: Unique email address (used for authentication)
        first_name: User's first name (2-50 characters)
        last_name: User's last name (2-50 characters)
        is_admin: Boolean indicating if user has admin privileges
        is_active: Boolean indicating if user account is active
        is_staff: Boolean for Django admin access
        created_at: Timestamp of account creation
        updated_at: Timestamp of last profile update
        deleted: Boolean for soft delete (user can delete their account)
        deleted_at: Timestamp of account deletion
    """
    
    # Primary identification
    email = models.EmailField(
        max_length=255,
        unique=True,
        db_index=True,
        help_text="User's email address (used for login)"
    )
    
    # Personal information
    first_name = models.CharField(
        max_length=50,
        help_text="User's first name (2-50 characters)"
    )
    last_name = models.CharField(
        max_length=50,
        help_text="User's last name (2-50 characters)"
    )
    
    # Permissions and status
    is_admin = models.BooleanField(
        default=False,
        help_text="Designates whether user has admin privileges"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Designates whether user can log in"
    )
    is_staff = models.BooleanField(
        default=False,
        help_text="Designates whether user can access Django admin"
    )
    
    # Timestamps
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp of account creation"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp of last profile update"
    )
    
    # Soft delete
    deleted = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Soft delete flag - user account is archived, not permanently deleted"
    )
    deleted_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp of account deletion"
    )
    
    # User manager
    objects = UserManager()
    
    # Authentication settings
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']
    
    def __str__(self):
        """String representation of user."""
        return f"{self.first_name} {self.last_name} ({self.email})"
    
    def save(self, *args, **kwargs):
        """
        Override save to normalize email to lowercase.
        
        This ensures email uniqueness is case-insensitive.
        """
        if self.email:
            self.email = self.email.lower().strip()
        super().save(*args, **kwargs)
    
    def get_full_name(self):
        """
        Return user's full name.
        
        Returns:
            str: Full name in format "First Last"
        """
        return f"{self.first_name} {self.last_name}".strip()
    
    def get_short_name(self):
        """
        Return user's first name.
        
        Returns:
            str: First name
        """
        return self.first_name
    
    def soft_delete(self):
        """
        Soft delete the user account.
        
        Sets deleted=True and deleted_at timestamp.
        User's recipes remain but display "Anonymous User".
        """
        self.deleted = True
        self.deleted_at = timezone.now()
        self.is_active = False  # Prevent login
        self.save()
    
    def restore(self):
        """
        Restore a soft-deleted user account.
        
        Sets deleted=False and clears deleted_at timestamp.
        Only admins can restore accounts.
        """
        self.deleted = False
        self.deleted_at = None
        self.is_active = True
        self.save()


class PasswordResetToken(models.Model):
    """
    Model to store password reset tokens.
    
    Fields:
        user: Foreign key to User model
        token: Unique cryptographically secure token
        token_expiry: Expiration timestamp (1 hour from creation)
        used: Boolean indicating if token has been used
        created_at: Timestamp of token creation
    """
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='password_reset_tokens',
        help_text="User requesting password reset"
    )
    
    token = models.CharField(
        max_length=255,
        unique=True,
        db_index=True,
        help_text="Cryptographically secure random token"
    )
    
    token_expiry = models.DateTimeField(
        help_text="Token expiration time (1 hour from creation)"
    )
    
    used = models.BooleanField(
        default=False,
        help_text="Whether this token has been used"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp of token creation"
    )
    
    class Meta:
        db_table = 'password_reset_tokens'
        verbose_name = 'Password Reset Token'
        verbose_name_plural = 'Password Reset Tokens'
        ordering = ['-created_at']
    
    def __str__(self):
        """String representation of token."""
        return f"Password reset token for {self.user.email}"
    
    def is_valid(self):
        """
        Check if token is still valid.
        
        Returns:
            bool: True if token is not expired and not used
        """
        return (
            not self.used and
            timezone.now() < self.token_expiry
        )
    
    def mark_as_used(self):
        """Mark token as used."""
        self.used = True
        self.save()
