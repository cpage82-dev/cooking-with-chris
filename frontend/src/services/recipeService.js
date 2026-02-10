/**
 * Recipe service
 */
import api from './api';

const recipeService = {
  /**
   * Get all recipes with optional filters
   */
  getRecipes: async (params = {}) => {
    const response = await api.get('/recipes/', { params });
    return response.data;
  },

  /**
   * Get single recipe by ID
   */
  getRecipe: async (id) => {
    const response = await api.get(`/recipes/${id}/`);
    return response.data;
  },

/**
 * Create new recipe (with image upload support)
 */
createRecipe: async (recipeData) => {
  const formData = new FormData();
  
  formData.append('recipe_name', recipeData.recipe_name);
  formData.append('recipe_description', recipeData.recipe_description);
  formData.append('course_type', recipeData.course_type);
  formData.append('recipe_type', recipeData.recipe_type);
  formData.append('primary_protein', recipeData.primary_protein);
  formData.append('ethnic_style', recipeData.ethnic_style);
  formData.append('prep_time', recipeData.prep_time);
  formData.append('cook_time', recipeData.cook_time);
  formData.append('number_servings', recipeData.number_servings);
  
  if (recipeData.recipe_image) {
    formData.append('recipe_image', recipeData.recipe_image);
  }
  
  formData.append('ingredient_sections', JSON.stringify(recipeData.ingredient_sections));
  formData.append('instruction_sections', JSON.stringify(recipeData.instruction_sections));
  
  // Let axios set Content-Type automatically
  const response = await api.post('/recipes/', formData);
  
  return response.data;
},

  /**
   * Update existing recipe
   */
  updateRecipe: async (id, recipeData) => {
    const response = await api.put(`/recipes/${id}/`, recipeData);
    return response.data;
  },

  /**
   * Delete recipe (soft delete)
   */
  deleteRecipe: async (id) => {
    const response = await api.delete(`/recipes/${id}/`);
    return response.data;
  },

  /**
   * Search recipes
   */
  searchRecipes: async (searchTerm) => {
    const response = await api.get('/recipes/', {
      params: { search: searchTerm },
    });
    return response.data;
  },

  /**
   * Filter recipes
   */
  filterRecipes: async (filters) => {
    const response = await api.get('/recipes/', {
      params: filters,
    });
    return response.data;
  },
};

export default recipeService;
