"""
Django admin configuration for Recipe models.
"""
from django.contrib import admin
import nested_admin
from .models import (
    Recipe,
    IngredientSection,
    Ingredient,
    InstructionSection,
    Instruction,
    Comment
)


class IngredientInline(nested_admin.NestedTabularInline):
    """Inline admin for ingredients within a section."""
    model = Ingredient
    extra = 1
    fields = ['ingredient_quantity', 'ingredient_uom', 'ingredient_name', 'ingredient_order']
    ordering = ['ingredient_order']


class IngredientSectionInline(nested_admin.NestedStackedInline):
    """Inline admin for ingredient sections within a recipe."""
    model = IngredientSection
    extra = 1
    fields = ['section_title', 'section_order']
    ordering = ['section_order']
    inlines = [IngredientInline]  # Now this works!


class InstructionInline(nested_admin.NestedTabularInline):
    """Inline admin for instructions within a section."""
    model = Instruction
    extra = 1
    fields = ['instruction_step', 'step_order']
    ordering = ['step_order']


class InstructionSectionInline(nested_admin.NestedStackedInline):
    """Inline admin for instruction sections within a recipe."""
    model = InstructionSection
    extra = 1
    fields = ['section_title', 'section_order']
    ordering = ['section_order']
    inlines = [InstructionInline]  # Now this works!


@admin.register(Recipe)
class RecipeAdmin(nested_admin.NestedModelAdmin):
    """Admin interface for Recipe model."""
    
    list_display = [
        'recipe_name',
        'user',
        'course_type',
        'recipe_type',
        'total_time',
        'number_servings',
        'deleted',
        'created_at',
    ]
    list_filter = ['deleted', 'course_type', 'recipe_type', 'primary_protein', 'created_at']
    search_fields = ['recipe_name', 'recipe_description', 'user__email']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('recipe_name', 'recipe_description', 'recipe_image', 'user')
        }),
        ('Classification', {
            'fields': ('course_type', 'recipe_type', 'primary_protein', 'ethnic_style')
        }),
        ('Time and Servings', {
            'fields': ('prep_time', 'cook_time', 'number_servings')
        }),
        ('Status', {
            'fields': ('deleted', 'deleted_at', 'created_at', 'updated_at')
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at', 'deleted_at']
    
    # Nested inlines now work!
    inlines = [IngredientSectionInline, InstructionSectionInline]


@admin.register(IngredientSection)
class IngredientSectionAdmin(nested_admin.NestedModelAdmin):
    """Admin interface for Ingredient Sections."""
    
    list_display = ['recipe', 'section_title', 'section_order']
    list_filter = ['recipe']
    search_fields = ['section_title', 'recipe__recipe_name']
    ordering = ['recipe', 'section_order']
    
    inlines = [IngredientInline]


@admin.register(InstructionSection)
class InstructionSectionAdmin(nested_admin.NestedModelAdmin):
    """Admin interface for Instruction Sections."""
    
    list_display = ['recipe', 'section_title', 'section_order']
    list_filter = ['recipe']
    search_fields = ['section_title', 'recipe__recipe_name']
    ordering = ['recipe', 'section_order']
    
    inlines = [InstructionInline]


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    """Admin interface for Comments."""
    list_display = ['id', 'get_user_display', 'recipe', 'comment_text_preview', 'created_at']
    list_filter = ['created_at', 'recipe']
    search_fields = ['comment_text', 'user__email', 'recipe__recipe_name']
    readonly_fields = ['created_at']
    
    def comment_text_preview(self, obj):
        """Show first 50 characters of comment."""
        return obj.comment_text[:50] + '...' if len(obj.comment_text) > 50 else obj.comment_text
    comment_text_preview.short_description = 'Comment'
    
    def get_user_display(self, obj):
        """Display user name or Anonymous."""
        return obj.get_user_display()
    get_user_display.short_description = 'User'