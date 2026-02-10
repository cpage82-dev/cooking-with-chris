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
   * Create new recipe
   */
  createRecipe: async (recipeData) => {
    const response = await api.post('/recipes/', recipeData);
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
