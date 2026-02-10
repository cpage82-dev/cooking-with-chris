"""
Serializers for Recipe model and related models.

This module provides serializers for:
- Recipe list view (lightweight)
- Recipe detail view (complete with ingredients and instructions)
- Recipe create/update operations
"""

from rest_framework import serializers
from .models import (
    Recipe,
    IngredientSection,
    Ingredient,
    InstructionSection,
    Instruction,
)
from apps.users.serializers import UserListSerializer


class IngredientSerializer(serializers.ModelSerializer):
    """
    Serializer for individual ingredients.
    """
    
    class Meta:
        model = Ingredient
        fields = [
            'id',
            'ingredient_quantity',
            'ingredient_uom',
            'ingredient_name',
            'ingredient_order',
        ]
    
    def validate_ingredient_name(self, value):
        """Validate ingredient name length."""
        if len(value) > 150:
            raise serializers.ValidationError(
                "This section is capped at 150 characters."
            )
        return value.strip()


class IngredientSectionSerializer(serializers.ModelSerializer):
    """
    Serializer for ingredient sections with nested ingredients.
    """
    
    ingredients = IngredientSerializer(many=True)
    
    class Meta:
        model = IngredientSection
        fields = [
            'id',
            'section_title',
            'section_order',
            'ingredients',
        ]
    
    def validate_section_title(self, value):
        """Validate section title length."""
        if len(value) > 150:
            raise serializers.ValidationError(
                "This section is capped at 150 characters."
            )
        return value.strip()


class InstructionSerializer(serializers.ModelSerializer):
    """
    Serializer for individual instruction steps.
    """
    
    class Meta:
        model = Instruction
        fields = [
            'id',
            'instruction_step',
            'step_order',
        ]
    
    def validate_instruction_step(self, value):
        """Validate instruction step length."""
        if len(value) > 500:
            raise serializers.ValidationError(
                "This section is capped at 500 characters."
            )
        return value.strip()


class InstructionSectionSerializer(serializers.ModelSerializer):
    """
    Serializer for instruction sections with nested instructions.
    """
    
    instructions = InstructionSerializer(many=True)
    
    class Meta:
        model = InstructionSection
        fields = [
            'id',
            'section_title',
            'section_order',
            'instructions',
        ]
    
    def validate_section_title(self, value):
        """Validate section title length."""
        if len(value) > 150:
            raise serializers.ValidationError(
                "This section is capped at 150 characters."
            )
        return value.strip()


class RecipeListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for recipe list view.
    
    Used in Recipe Menu table with pagination.
    Does not include full ingredients/instructions.
    """
    
    creator_name = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    total_time = serializers.SerializerMethodField()
    
    class Meta:
        model = Recipe
        fields = [
            'id',
            'recipe_name',
            'recipe_image',
            'thumbnail_url',
            'course_type',
            'recipe_type',
            'primary_protein',
            'ethnic_style',
            'total_time',
            'number_servings',
            'created_at',
            'creator_name',
        ]
    
    def get_creator_name(self, obj):
        """Return creator's full name or 'Anonymous User'."""
        return obj.get_creator_name()
    
    def get_total_time(self, obj):
        """Return calculated total time (prep_time + cook_time)."""
        return obj.total_time
    
    def get_thumbnail_url(self, obj):
        """
        Return optimized thumbnail URL for table display.
    
        Uses Cloudinary transformation to create 80x80px thumbnail.
        If no image, returns default image URL.
        """
        if obj.recipe_image:
            # CloudinaryField has a .url property
            try:
                url = obj.recipe_image.url
                if 'cloudinary.com' in url and '/upload/' in url:
                    parts = url.split('/upload/')
                    return f"{parts[0]}/upload/w_80,h_80,c_fill,q_auto,f_auto/{parts[1]}"
                return url
            except (AttributeError, ValueError):
                # If Cloudinary URL generation fails, return None
                pass
    
    # Default image
        return "https://as1.ftcdn.net/v2/jpg/00/81/88/98/1000_F_81889870_D1KroNymRQ1EfNZu8GDR0ZOxQSgocxUf.jpg"


class RecipeDetailSerializer(serializers.ModelSerializer):
    """
    Complete serializer for recipe detail view.
    
    Includes all recipe information with nested ingredients and instructions.
    """
    
    creator_name = serializers.SerializerMethodField()
    creator_id = serializers.SerializerMethodField()
    total_time = serializers.SerializerMethodField()
    ingredient_sections = IngredientSectionSerializer(many=True, read_only=True)
    instruction_sections = InstructionSectionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Recipe
        fields = [
            'id',
            'recipe_name',
            'recipe_description',
            'recipe_image',
            'course_type',
            'recipe_type',
            'primary_protein',
            'ethnic_style',
            'prep_time',
            'cook_time',
            'total_time',
            'number_servings',
            'created_at',
            'updated_at',
            'creator_name',
            'creator_id',
            'ingredient_sections',
            'instruction_sections',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'total_time']
    
    def get_creator_name(self, obj):
        """Return creator's full name or 'Anonymous User'."""
        return obj.get_creator_name()
    
    def get_creator_id(self, obj):
        """Return creator's user ID or None if user is deleted."""
        if obj.user and not obj.user.deleted:
            return obj.user.id
        return None
    
    def get_total_time(self, obj):
        """Return calculated total time (prep_time + cook_time)."""
        return obj.total_time


class RecipeCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating recipes.
    
    Handles nested creation/update of ingredient and instruction sections.
    """
    
    ingredient_sections = IngredientSectionSerializer(many=True)
    instruction_sections = InstructionSectionSerializer(many=True)
    
    class Meta:
        model = Recipe
        fields = [
            'id',
            'recipe_name',
            'recipe_description',
            'recipe_image',
            'course_type',
            'recipe_type',
            'primary_protein',
            'ethnic_style',
            'prep_time',
            'cook_time',
            'number_servings',
            'ingredient_sections',
            'instruction_sections',
        ]
        read_only_fields = ['id']
    
    def validate_recipe_name(self, value):
        """
        Validate recipe name uniqueness and length.
        
        Rules:
        - Max 150 characters
        - Must be unique globally (case-insensitive)
        - If editing, allow same name for same recipe
        """
        if len(value) > 150:
            raise serializers.ValidationError(
                "This section is capped at 150 characters."
            )
        
        value = value.strip()
        
        # Check uniqueness (case-insensitive)
        recipe_id = self.instance.id if self.instance else None
        existing = Recipe.objects.filter(
            recipe_name__iexact=value
        ).exclude(id=recipe_id).exists()
        
        if existing:
            raise serializers.ValidationError(
                "This recipe name already exists. Try adding a unique descriptor."
            )
        
        return value
    
    def validate_recipe_description(self, value):
        """Validate recipe description length."""
        if len(value) > 1000:
            raise serializers.ValidationError(
                "This section is capped at 1000 characters."
            )
        return value.strip()
    
    def validate(self, data):
        """
        Validate complete recipe data.
        
        Rules:
        - Must have at least one ingredient section
        - Each ingredient section must have at least one ingredient
        - Must have at least one instruction section
        - Each instruction section must have at least one instruction
        """
        # Validate ingredient sections
        ingredient_sections = data.get('ingredient_sections', [])
        if not ingredient_sections:
            raise serializers.ValidationError({
                'ingredient_sections': 'Recipe must have at least one ingredient section.'
            })
        
        for section in ingredient_sections:
            if not section.get('ingredients'):
                raise serializers.ValidationError({
                    'ingredient_sections': 'Each ingredient section must have at least one ingredient.'
                })
        
        # Validate instruction sections
        instruction_sections = data.get('instruction_sections', [])
        if not instruction_sections:
            raise serializers.ValidationError({
                'instruction_sections': 'Recipe must have at least one instruction section.'
            })
        
        for section in instruction_sections:
            if not section.get('instructions'):
                raise serializers.ValidationError({
                    'instruction_sections': 'Each instruction section must have at least one step.'
                })
        
        return data
    
    def create(self, validated_data):
        """
        Create new recipe with nested ingredients and instructions.
        """
        ingredient_sections_data = validated_data.pop('ingredient_sections')
        instruction_sections_data = validated_data.pop('instruction_sections')
        
        # Create recipe
        recipe = Recipe.objects.create(**validated_data)
        
        # Create ingredient sections and ingredients
        for section_data in ingredient_sections_data:
            ingredients_data = section_data.pop('ingredients')
            ingredient_section = IngredientSection.objects.create(
                recipe=recipe,
                **section_data
            )
            
            for ingredient_data in ingredients_data:
                Ingredient.objects.create(
                    section=ingredient_section,
                    **ingredient_data
                )
        
        # Create instruction sections and instructions
        for section_data in instruction_sections_data:
            instructions_data = section_data.pop('instructions')
            instruction_section = InstructionSection.objects.create(
                recipe=recipe,
                **section_data
            )
            
            for instruction_data in instructions_data:
                Instruction.objects.create(
                    section=instruction_section,
                    **instruction_data
                )
        
        return recipe
    
    def update(self, instance, validated_data):
        """
        Update recipe with nested ingredients and instructions.
        
        Strategy: Delete all existing sections and recreate from scratch.
        This is simpler than complex diff/merge logic.
        """
        ingredient_sections_data = validated_data.pop('ingredient_sections', None)
        instruction_sections_data = validated_data.pop('instruction_sections', None)
        
        # Update basic recipe fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update ingredient sections if provided
        if ingredient_sections_data is not None:
            # Delete existing sections (CASCADE deletes ingredients)
            instance.ingredient_sections.all().delete()
            
            # Create new sections and ingredients
            for section_data in ingredient_sections_data:
                ingredients_data = section_data.pop('ingredients')
                ingredient_section = IngredientSection.objects.create(
                    recipe=instance,
                    **section_data
                )
                
                for ingredient_data in ingredients_data:
                    Ingredient.objects.create(
                        section=ingredient_section,
                        **ingredient_data
                    )
        
        # Update instruction sections if provided
        if instruction_sections_data is not None:
            # Delete existing sections (CASCADE deletes instructions)
            instance.instruction_sections.all().delete()
            
            # Create new sections and instructions
            for section_data in instruction_sections_data:
                instructions_data = section_data.pop('instructions')
                instruction_section = InstructionSection.objects.create(
                    recipe=instance,
                    **section_data
                )
                
                for instruction_data in instructions_data:
                    Instruction.objects.create(
                        section=instruction_section,
                        **instruction_data
                    )
        
        return instance
