/**
 * Create Recipe Page
 * Form to create a new recipe with ingredients and instructions
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import recipeService from '../services/recipeService';

const CreateRecipePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Basic recipe info
  const [formData, setFormData] = useState({
    recipe_name: '',
    recipe_description: '',
    recipe_image: null,
    course_type: '',
    recipe_type: '',
    primary_protein: '',
    ethnic_style: '',
    prep_time: '',
    cook_time: '',
    number_servings: '',
  });

  // Ingredient sections
  const [ingredientSections, setIngredientSections] = useState([
    {
      section_title: 'Main Ingredients',
      section_order: 1,
      ingredients: [
        { ingredient_quantity: '', ingredient_uom: '', ingredient_name: '', ingredient_order: 1 },
      ],
    },
  ]);

  // Instruction sections
  const [instructionSections, setInstructionSections] = useState([
    {
      section_title: 'Preparation',
      section_order: 1,
      instructions: [
        { instruction_step: '', step_order: 1 },
      ],
    },
  ]);

  // Handle basic form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        recipe_image: file,
      }));
    }
  };

  // Add new ingredient section
  const addIngredientSection = () => {
    setIngredientSections([
      ...ingredientSections,
      {
        section_title: '',
        section_order: ingredientSections.length + 1,
        ingredients: [
          { ingredient_quantity: '', ingredient_uom: '', ingredient_name: '', ingredient_order: 1 },
        ],
      },
    ]);
  };

  // Remove ingredient section
  const removeIngredientSection = (sectionIndex) => {
    const updated = ingredientSections.filter((_, index) => index !== sectionIndex);
    // Re-order sections
    updated.forEach((section, index) => {
      section.section_order = index + 1;
    });
    setIngredientSections(updated);
  };

  // Add ingredient to section
  const addIngredient = (sectionIndex) => {
    const updated = [...ingredientSections];
    updated[sectionIndex].ingredients.push({
      ingredient_quantity: '',
      ingredient_uom: '',
      ingredient_name: '',
      ingredient_order: updated[sectionIndex].ingredients.length + 1,
    });
    setIngredientSections(updated);
  };

  // Remove ingredient from section
  const removeIngredient = (sectionIndex, ingredientIndex) => {
    const updated = [...ingredientSections];
    updated[sectionIndex].ingredients = updated[sectionIndex].ingredients.filter(
      (_, index) => index !== ingredientIndex
    );
    // Re-order ingredients
    updated[sectionIndex].ingredients.forEach((ingredient, index) => {
      ingredient.ingredient_order = index + 1;
    });
    setIngredientSections(updated);
  };

  // Update ingredient section title
  const updateIngredientSectionTitle = (sectionIndex, title) => {
    const updated = [...ingredientSections];
    updated[sectionIndex].section_title = title;
    setIngredientSections(updated);
  };

  // Update ingredient field
  const updateIngredient = (sectionIndex, ingredientIndex, field, value) => {
    const updated = [...ingredientSections];
    updated[sectionIndex].ingredients[ingredientIndex][field] = value;
    setIngredientSections(updated);
  };

  // Add new instruction section
  const addInstructionSection = () => {
    setInstructionSections([
      ...instructionSections,
      {
        section_title: '',
        section_order: instructionSections.length + 1,
        instructions: [
          { instruction_step: '', step_order: 1 },
        ],
      },
    ]);
  };

  // Remove instruction section
  const removeInstructionSection = (sectionIndex) => {
    const updated = instructionSections.filter((_, index) => index !== sectionIndex);
    // Re-order sections
    updated.forEach((section, index) => {
      section.section_order = index + 1;
    });
    setInstructionSections(updated);
  };

  // Add instruction to section
  const addInstruction = (sectionIndex) => {
    const updated = [...instructionSections];
    updated[sectionIndex].instructions.push({
      instruction_step: '',
      step_order: updated[sectionIndex].instructions.length + 1,
    });
    setInstructionSections(updated);
  };

  // Remove instruction from section
  const removeInstruction = (sectionIndex, instructionIndex) => {
    const updated = [...instructionSections];
    updated[sectionIndex].instructions = updated[sectionIndex].instructions.filter(
      (_, index) => index !== instructionIndex
    );
    // Re-order instructions
    updated[sectionIndex].instructions.forEach((instruction, index) => {
      instruction.step_order = index + 1;
    });
    setInstructionSections(updated);
  };

  // Update instruction section title
  const updateInstructionSectionTitle = (sectionIndex, title) => {
    const updated = [...instructionSections];
    updated[sectionIndex].section_title = title;
    setInstructionSections(updated);
  };

  // Update instruction field
  const updateInstruction = (sectionIndex, instructionIndex, value) => {
    const updated = [...instructionSections];
    updated[sectionIndex].instructions[instructionIndex].instruction_step = value;
    setInstructionSections(updated);
  };

  // Validate form
  const validateForm = () => {
    // Check required basic fields
    if (!formData.recipe_name.trim()) {
      setError('Recipe name is required');
      return false;
    }
    if (!formData.recipe_description.trim()) {
      setError('Recipe description is required');
      return false;
    }
    if (!formData.course_type) {
      setError('Course type is required');
      return false;
    }
    if (!formData.recipe_type) {
      setError('Recipe type is required');
      return false;
    }
    if (!formData.primary_protein) {
      setError('Primary protein is required');
      return false;
    }
    if (!formData.ethnic_style) {
      setError('Ethnic style is required');
      return false;
    }
    if (!formData.prep_time || formData.prep_time < 0) {
      setError('Valid prep time is required');
      return false;
    }
    if (!formData.cook_time || formData.cook_time < 0) {
      setError('Valid cook time is required');
      return false;
    }
    if (!formData.number_servings || formData.number_servings < 1) {
      setError('Number of servings must be at least 1');
      return false;
    }

    // Check ingredients
    for (const section of ingredientSections) {
      if (!section.section_title.trim()) {
        setError('All ingredient sections must have a title');
        return false;
      }
      if (section.ingredients.length === 0) {
        setError('Each ingredient section must have at least one ingredient');
        return false;
      }
      for (const ingredient of section.ingredients) {
        if (!ingredient.ingredient_name.trim()) {
          setError('All ingredients must have a name');
          return false;
        }
      }
    }

    // Check instructions
    for (const section of instructionSections) {
      if (!section.section_title.trim()) {
        setError('All instruction sections must have a title');
        return false;
      }
      if (section.instructions.length === 0) {
        setError('Each instruction section must have at least one step');
        return false;
      }
      for (const instruction of section.instructions) {
        if (!instruction.instruction_step.trim()) {
          setError('All instruction steps must have text');
          return false;
        }
      }
    }

    return true;
  };

// Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  if (!validateForm()) {
    return;
  }

  setLoading(true);

  try {
    // Prepare data for API (including image)
    const recipeData = {
      recipe_name: formData.recipe_name.trim(),
      recipe_description: formData.recipe_description.trim(),
      course_type: formData.course_type,
      recipe_type: formData.recipe_type,
      primary_protein: formData.primary_protein,
      ethnic_style: formData.ethnic_style,
      prep_time: parseInt(formData.prep_time),
      cook_time: parseInt(formData.cook_time),
      number_servings: parseInt(formData.number_servings),
      ingredient_sections: ingredientSections,
      instruction_sections: instructionSections,
    };

    // Add image if user selected one
    if (formData.recipe_image) {
      recipeData.recipe_image = formData.recipe_image;
    }

    const newRecipe = await recipeService.createRecipe(recipeData);
    
    // Redirect to the new recipe
    navigate(`/recipes/${newRecipe.id}`);
  } catch (err) {
    console.error('Error creating recipe:', err);
    if (err.response?.data) {
      const errorData = err.response.data;
      if (typeof errorData === 'object') {
        // Extract first error message
        const firstError = Object.values(errorData)[0];
        setError(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        setError('Failed to create recipe. Please check your inputs.');
      }
    } else {
      setError('Failed to create recipe. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Create New Recipe</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Basic Information</h2>

          <div className="space-y-4">
            {/* Recipe Name */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Recipe Name *
              </label>
              <input
                type="text"
                name="recipe_name"
                value={formData.recipe_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Description *
              </label>
              <textarea
                name="recipe_description"
                value={formData.recipe_description}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            {/* Image Upload (Optional for now) */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Recipe Image (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <p className="text-sm text-gray-500 mt-1">
                Please upload an image of your dish.
              </p>
            </div>

            {/* Grid for dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Course Type */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Course Type *
                </label>
                <select
                  name="course_type"
                  value={formData.course_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                >
                  <option value="">Select course type</option>
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Hors d'oeuvres">Hors d'oeuvres</option>
                  <option value="Appetizer">Appetizer</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Dessert">Dessert</option>
                </select>
              </div>

              {/* Recipe Type */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Recipe Type *
                </label>
                <select
                  name="recipe_type"
                  value={formData.recipe_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                >
                  <option value="">Select recipe type</option>
                  <option value="Entrée">Entrée</option>
                  <option value="Soup">Soup</option>
                  <option value="Salad">Salad</option>
                  <option value="Pizza">Pizza</option>
                  <option value="Starter">Starter</option>
                  <option value="Side Dish">Side Dish</option>
                  <option value="Sauce">Sauce</option>
                </select>
              </div>

              {/* Primary Protein */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Primary Protein *
                </label>
                <select
                  name="primary_protein"
                  value={formData.primary_protein}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                >
                  <option value="">Select protein</option>
                  <option value="Beef">Beef</option>
                  <option value="Chicken">Chicken</option>
                  <option value="Fish">Fish</option>
                  <option value="Pork">Pork</option>
                  <option value="Turkey">Turkey</option>
                  <option value="Vegetarian / None">Vegetarian / None</option>
                </select>
              </div>

              {/* Ethnic Style */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Cuisine Style *
                </label>
                <select
                  name="ethnic_style"
                  value={formData.ethnic_style}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                >
                  <option value="">Select cuisine</option>
                  <option value="American">American</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Caribbean">Caribbean</option>
                  <option value="Indian">Indian</option>
                  <option value="Italian">Italian</option>
                  <option value="Korean">Korean</option>
                  <option value="Mediterranean / Greek">Mediterranean / Greek</option>
                  <option value="Mexican / Tex-Mex">Mexican / Tex-Mex</option>
                  <option value="Middle Eastern">Middle Eastern</option>
                  <option value="Thai">Thai</option>
                </select>
              </div>

              {/* Prep Time */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Prep Time (minutes) *
                </label>
                <input
                  type="number"
                  name="prep_time"
                  value={formData.prep_time}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              {/* Cook Time */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Cook Time (minutes) *
                </label>
                <input
                  type="number"
                  name="cook_time"
                  value={formData.cook_time}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              {/* Servings */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Number of Servings *
                </label>
                <input
                  type="number"
                  name="number_servings"
                  value={formData.number_servings}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Ingredients</h2>
            <button
              type="button"
              onClick={addIngredientSection}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              + Add Ingredients Section
            </button>
          </div>

          {ingredientSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6 p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <input
                  type="text"
                  value={section.section_title}
                  onChange={(e) => updateIngredientSectionTitle(sectionIndex, e.target.value)}
                  placeholder="Section title (e.g., 'For the Sauce')"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
                {ingredientSections.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeIngredientSection(sectionIndex)}
                    className="ml-2 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition"
                  >
                    Remove Section
                  </button>
                )}
              </div>

              {section.ingredients.map((ingredient, ingredientIndex) => (
                <div key={ingredientIndex} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={ingredient.ingredient_quantity}
                    onChange={(e) =>
                      updateIngredient(sectionIndex, ingredientIndex, 'ingredient_quantity', e.target.value)
                    }
                    placeholder="Qty"
                    className="w-20 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <input
                    type="text"
                    value={ingredient.ingredient_uom}
                    onChange={(e) =>
                      updateIngredient(sectionIndex, ingredientIndex, 'ingredient_uom', e.target.value)
                    }
                    placeholder="UoM"
                    className="w-24 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <input
                    type="text"
                    value={ingredient.ingredient_name}
                    onChange={(e) =>
                      updateIngredient(sectionIndex, ingredientIndex, 'ingredient_name', e.target.value)
                    }
                    placeholder="Ingredient name *"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                  {section.ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(sectionIndex, ingredientIndex)}
                      className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => addIngredient(sectionIndex)}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                + Add Ingredient
              </button>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Instructions</h2>
            <button
              type="button"
              onClick={addInstructionSection}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              + Add Instruction Section
            </button>
          </div>

          {instructionSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6 p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <input
                  type="text"
                  value={section.section_title}
                  onChange={(e) => updateInstructionSectionTitle(sectionIndex, e.target.value)}
                  placeholder="Section title (e.g., 'Prepare the Dough')"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
                {instructionSections.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeInstructionSection(sectionIndex)}
                    className="ml-2 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition"
                  >
                    Remove Section
                  </button>
                )}
              </div>

              {section.instructions.map((instruction, instructionIndex) => (
                <div key={instructionIndex} className="flex gap-2 mb-2">
                  <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold mt-1">
                    {instruction.step_order}
                  </span>
                  <textarea
                    value={instruction.instruction_step}
                    onChange={(e) => updateInstruction(sectionIndex, instructionIndex, e.target.value)}
                    placeholder="Instruction step *"
                    rows="2"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                  {section.instructions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInstruction(sectionIndex, instructionIndex)}
                      className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition h-10"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => addInstruction(sectionIndex)}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                + Add Step
              </button>
            </div>
          ))}
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/recipes')}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? 'Creating...' : 'Create Recipe'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRecipePage;
