"""
Django admin configuration for Recipe models.
"""

from django.contrib import admin
from .models import (
    Recipe,
    IngredientSection,
    Ingredient,
    InstructionSection,
    Instruction,
)


class IngredientInline(admin.TabularInline):
    """Inline admin for ingredients within a section."""
    model = Ingredient
    extra = 1
    fields = ['ingredient_quantity', 'ingredient_uom', 'ingredient_name', 'ingredient_order']
    ordering = ['ingredient_order']


class IngredientSectionInline(admin.StackedInline):
    """Inline admin for ingredient sections within a recipe."""
    model = IngredientSection
    extra = 1
    fields = ['section_title', 'section_order']
    ordering = ['section_order']
    show_change_link = True


class InstructionInline(admin.TabularInline):
    """Inline admin for instructions within a section."""
    model = Instruction
    extra = 1
    fields = ['instruction_step', 'step_order']
    ordering = ['step_order']


class InstructionSectionInline(admin.StackedInline):
    """Inline admin for instruction sections within a recipe."""
    model = InstructionSection
    extra = 1
    fields = ['section_title', 'section_order']
    ordering = ['section_order']
    show_change_link = True


@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
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
            'fields': ('recipe_name', 'recipe_description', 'recipe_image_url', 'user')
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
    
    # Show inline sections only when editing existing recipe
    inlines = [IngredientSectionInline, InstructionSectionInline]


@admin.register(IngredientSection)
class IngredientSectionAdmin(admin.ModelAdmin):
    """Admin interface for Ingredient Sections."""
    
    list_display = ['recipe', 'section_title', 'section_order']
    list_filter = ['recipe']
    search_fields = ['section_title', 'recipe__recipe_name']
    ordering = ['recipe', 'section_order']
    
    inlines = [IngredientInline]


@admin.register(InstructionSection)
class InstructionSectionAdmin(admin.ModelAdmin):
    """Admin interface for Instruction Sections."""
    
    list_display = ['recipe', 'section_title', 'section_order']
    list_filter = ['recipe']
    search_fields = ['section_title', 'recipe__recipe_name']
    ordering = ['recipe', 'section_order']
    
    inlines = [InstructionInline]
