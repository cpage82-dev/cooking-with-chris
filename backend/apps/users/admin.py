"""
Django admin configuration for User model.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, PasswordResetToken


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Custom admin interface for User model.
    """
    
    list_display = [
        'email',
        'first_name',
        'last_name',
        'is_admin',
        'is_active',
        'deleted',
        'created_at',
    ]
    list_filter = ['is_admin', 'is_active', 'deleted', 'created_at']
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name')}),
        ('Permissions', {'fields': ('is_admin', 'is_active', 'is_staff', 'is_superuser')}),
        ('Important Dates', {'fields': ('created_at', 'updated_at', 'deleted', 'deleted_at')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2', 'is_admin'),
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at', 'deleted_at']
    
    # Enable mass restore action
    actions = ['restore_users']
    
    def restore_users(self, request, queryset):
        """Restore deleted user accounts."""
        count = 0
        for user in queryset:
            if user.deleted:
                user.restore()
                count += 1
        self.message_user(request, f'{count} user(s) restored successfully.')
    restore_users.short_description = "Restore selected deleted users"


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    """
    Admin interface for Password Reset Tokens.
    """
    
    list_display = ['user', 'token_expiry', 'used', 'created_at']
    list_filter = ['used', 'created_at']
    search_fields = ['user__email', 'token']
    readonly_fields = ['token', 'created_at', 'token_expiry']
    ordering = ['-created_at']
