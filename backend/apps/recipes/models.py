"""
Models for Recipe management.

This module contains all recipe-related models:
- Recipe: Main recipe model
- IngredientSection: Sections within a recipe's ingredient list
- Ingredient: Individual ingredients within sections
- InstructionSection: Sections within a recipe's instructions
- Instruction: Individual instruction steps within sections
"""

from django.db import models
from django.core.validators import MinValueValidator
from django.db.models.functions import Lower
from apps.users.models import User
from cloudinary.models import CloudinaryField


# Picklist value choices
COURSE_TYPE_CHOICES = [
    ('Breakfast', 'Breakfast'),
    ('Lunch', 'Lunch'),
    ('Snacks', 'Snacks'),
    ('Appetizer', 'Appetizer'),
    ('Dinner', 'Dinner'),
    ('Breads', 'Breads'),
    ('Dessert', 'Dessert'),
]

RECIPE_TYPE_CHOICES = [
    ('Entrée (Main)', 'Entrée (Main)'),
    ('Soup', 'Soup'),
    ('Salad', 'Salad'),
    ('Pizza', 'Pizza'),
    ('Pasta', 'Pasta'),
    ('Starter', 'Starter'),
    ('Side Dish', 'Side Dish'),
    ('Sauce', 'Sauce'),
]

PRIMARY_PROTEIN_CHOICES = [
    ('Beef', 'Beef'),
    ('Chicken', 'Chicken'),
    ('Fish', 'Fish'),
    ('Pork', 'Pork'),
    ('Turkey', 'Turkey'),
    ('Vegetarian', 'Vegetarian'),
    ('None', 'None'),
]

ETHNIC_STYLE_CHOICES = [
    ('American', 'American'),
    ('Chinese', 'Chinese'),
    ('Caribbean', 'Caribbean'),
    ('Indian', 'Indian'),
    ('Italian', 'Italian'),
    ('Korean', 'Korean'),
    ('Mediterranean / Greek', 'Mediterranean / Greek'),
    ('Mexican / Tex-Mex', 'Mexican / Tex-Mex'),
    ('Middle Eastern', 'Middle Eastern'),
    ('Thai', 'Thai'),
]


class Recipe(models.Model):
    """
    Main Recipe model.
    
    Contains all the high-level information about a recipe including
    metadata, cook times, and relationships to ingredients and instructions.
    
    Fields:
        user: Foreign key to User who created the recipe
        recipe_name: Name of the recipe (unique, max 150 chars)
        recipe_description: Description of the recipe (max 1000 chars)
        recipe_image: Cloudinary URL for recipe image
        course_type: Type of course (Breakfast, Dinner, etc.)
        recipe_type: Type of recipe (Entrée, Soup, etc.)
        primary_protein: Main protein (Beef, Chicken, etc.)
        ethnic_style: Cuisine style (Italian, Mexican, etc.)
        prep_time: Preparation time in minutes
        cook_time: Cooking time in minutes
        total_time: Computed field (prep_time + cook_time)
        number_servings: Number of servings the recipe makes
        created_at: Timestamp of recipe creation
        updated_at: Timestamp of last update
        deleted: Soft delete flag
        deleted_at: Timestamp of deletion
    """
    
    # User relationship
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='recipes',
        help_text="User who created this recipe"
    )
    
    # Basic information
    recipe_name = models.CharField(
        max_length=150,
        unique=True,
        db_index=True,
        help_text="Name of the recipe (must be unique, max 150 characters)"
    )
    
    recipe_description = models.TextField(
        max_length=1000,
        help_text="Description of the recipe (max 1000 characters)"
    )
    
    recipe_image = CloudinaryField(
        'image',
        folder='recipes',
        null=True,
        blank=True,
        help_text="Recipe image (uploaded to Cloudinary)"
    )
    
    # Classification fields
    course_type = models.CharField(
        max_length=50,
        choices=COURSE_TYPE_CHOICES,
        help_text="Type of course (Breakfast, Lunch, Dinner, etc.)"
    )
    
    recipe_type = models.CharField(
        max_length=50,
        choices=RECIPE_TYPE_CHOICES,
        help_text="Type of recipe (Entrée, Soup, Salad, etc.)"
    )
    
    primary_protein = models.CharField(
        max_length=50,
        choices=PRIMARY_PROTEIN_CHOICES,
        help_text="Primary protein (Beef, Chicken, Fish, etc.)"
    )
    
    ethnic_style = models.CharField(
        max_length=50,
        choices=ETHNIC_STYLE_CHOICES,
        help_text="Ethnic cuisine style (Italian, Mexican, etc.)"
    )
    
    # Time and servings
    prep_time = models.IntegerField(
        validators=[MinValueValidator(0)],
        help_text="Preparation time in minutes"
    )
    
    cook_time = models.IntegerField(
        validators=[MinValueValidator(0)],
        help_text="Cooking time in minutes"
    )
    
    number_servings = models.IntegerField(
        validators=[MinValueValidator(1)],
        help_text="Number of servings this recipe makes"
    )
    
    # Timestamps
    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        help_text="Timestamp of recipe creation"
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp of last update"
    )
    
    # Soft delete
    deleted = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Soft delete flag - recipe is archived, not permanently deleted"
    )
    
    deleted_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp of deletion"
    )
    
    class Meta:
        db_table = 'recipes'
        verbose_name = 'Recipe'
        verbose_name_plural = 'Recipes'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['deleted', '-created_at']),
            models.Index(fields=['recipe_name']),
        ]
        constraints = [
            models.UniqueConstraint(
                Lower('recipe_name'),
                name='unique_recipe_name_case_insensitive'
            )
        ]
    
    def __str__(self):
        """String representation of recipe."""
        return self.recipe_name
    
    @property
    def total_time(self):
        """
        Calculate total time as sum of prep_time and cook_time.
        
        Returns:
            int: Total time in minutes
        """
        return self.prep_time + self.cook_time
    
    def get_creator_name(self):
        """
        Get the name of the recipe creator.
        
        Returns "Anonymous User" if user is deleted or None.
        
        Returns:
            str: Creator's full name or "Anonymous User"
        """
        if self.user and not self.user.deleted:
            return self.user.get_full_name()
        return "Anonymous User"


class IngredientSection(models.Model):
    """
    Section within a recipe's ingredient list.
    
    Recipes can have multiple ingredient sections (e.g., "For the Sauce", "For the Crust").
    Each section contains multiple ingredients.
    
    Fields:
        recipe: Foreign key to Recipe
        section_title: Title of the section (max 150 chars)
        section_order: Order of this section within the recipe
    """
    
    recipe = models.ForeignKey(
        Recipe,
        on_delete=models.CASCADE,
        related_name='ingredient_sections',
        help_text="Recipe this section belongs to"
    )
    
    section_title = models.CharField(
        max_length=150,
        help_text="Title of this ingredient section (max 150 characters)"
    )
    
    section_order = models.IntegerField(
        help_text="Order of this section within the recipe (1, 2, 3, ...)"
    )
    
    class Meta:
        db_table = 'ingredient_sections'
        verbose_name = 'Ingredient Section'
        verbose_name_plural = 'Ingredient Sections'
        ordering = ['recipe', 'section_order']
        constraints = [
            models.UniqueConstraint(
                fields=['recipe', 'section_order'],
                name='unique_ingredient_section_order'
            )
        ]
    
    def __str__(self):
        """String representation of ingredient section."""
        return f"{self.recipe.recipe_name} - {self.section_title}"


class Ingredient(models.Model):
    """
    Individual ingredient within an ingredient section.
    
    Fields:
        section: Foreign key to IngredientSection
        ingredient_quantity: Quantity (e.g., "2", "1/4", can be null)
        ingredient_uom: Unit of measure (e.g., "cups", "tbsp", can be null)
        ingredient_name: Name of ingredient (e.g., "all-purpose flour")
        ingredient_order: Order of this ingredient within the section
    """
    
    section = models.ForeignKey(
        IngredientSection,
        on_delete=models.CASCADE,
        related_name='ingredients',
        help_text="Section this ingredient belongs to"
    )
    
    ingredient_quantity = models.CharField(
        max_length=20,
        null=True,
        blank=True,
        help_text="Quantity (e.g., '2', '1/4', can be null for 'to taste')"
    )
    
    ingredient_uom = models.CharField(
        max_length=20,
        null=True,
        blank=True,
        help_text="Unit of measure (e.g., 'cups', 'tbsp', can be null)"
    )
    
    ingredient_name = models.CharField(
        max_length=150,
        db_index=True,
        help_text="Name of the ingredient (max 150 characters)"
    )
    
    ingredient_order = models.IntegerField(
        help_text="Order of this ingredient within the section (1, 2, 3, ...)"
    )
    
    class Meta:
        db_table = 'ingredients'
        verbose_name = 'Ingredient'
        verbose_name_plural = 'Ingredients'
        ordering = ['section', 'ingredient_order']
        constraints = [
            models.UniqueConstraint(
                fields=['section', 'ingredient_order'],
                name='unique_ingredient_order'
            )
        ]
        indexes = [
            models.Index(fields=['ingredient_name']),
        ]
    
    def __str__(self):
        """String representation of ingredient."""
        parts = []
        if self.ingredient_quantity:
            parts.append(self.ingredient_quantity)
        if self.ingredient_uom:
            parts.append(self.ingredient_uom)
        parts.append(self.ingredient_name)
        return ' '.join(parts)


class InstructionSection(models.Model):
    """
    Section within a recipe's instructions.
    
    Recipes can have multiple instruction sections (e.g., "Make the Dough", "Prepare the Filling").
    Each section contains multiple instruction steps.
    
    Fields:
        recipe: Foreign key to Recipe
        section_title: Title of the section (max 150 chars)
        section_order: Order of this section within the recipe
    """
    
    recipe = models.ForeignKey(
        Recipe,
        on_delete=models.CASCADE,
        related_name='instruction_sections',
        help_text="Recipe this section belongs to"
    )
    
    section_title = models.CharField(
        max_length=150,
        help_text="Title of this instruction section (max 150 characters)"
    )
    
    section_order = models.IntegerField(
        help_text="Order of this section within the recipe (1, 2, 3, ...)"
    )
    
    class Meta:
        db_table = 'instruction_sections'
        verbose_name = 'Instruction Section'
        verbose_name_plural = 'Instruction Sections'
        ordering = ['recipe', 'section_order']
        constraints = [
            models.UniqueConstraint(
                fields=['recipe', 'section_order'],
                name='unique_instruction_section_order'
            )
        ]
    
    def __str__(self):
        """String representation of instruction section."""
        return f"{self.recipe.recipe_name} - {self.section_title}"


class Instruction(models.Model):
    """
    Individual instruction step within an instruction section.
    
    Fields:
        section: Foreign key to InstructionSection
        instruction_step: The instruction text (max 500 chars)
        step_order: Order of this step within the section
    """
    
    section = models.ForeignKey(
        InstructionSection,
        on_delete=models.CASCADE,
        related_name='instructions',
        help_text="Section this instruction belongs to"
    )
    
    instruction_step = models.TextField(
        max_length=500,
        help_text="The instruction text (max 500 characters)"
    )
    
    step_order = models.IntegerField(
        help_text="Order of this step within the section (1, 2, 3, ...)"
    )
    
    class Meta:
        db_table = 'instructions'
        verbose_name = 'Instruction'
        verbose_name_plural = 'Instructions'
        ordering = ['section', 'step_order']
        constraints = [
            models.UniqueConstraint(
                fields=['section', 'step_order'],
                name='unique_instruction_order'
            )
        ]
    
    def __str__(self):
        """String representation of instruction."""
        return f"Step {self.step_order}: {self.instruction_step[:50]}..."
