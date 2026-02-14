/**
 * Comment Service
 * API calls for recipe comments
 */
import api from './api';

const commentService = {
  /**
   * Get all comments for a recipe
   */
  getComments: async (recipeId) => {
    const response = await api.get(`/recipes/comments/?recipe=${recipeId}`);
    return response.data;
  },

  /**
   * Create a new comment
   */
  createComment: async (recipeId, commentText) => {
    const response = await api.post('/recipes/comments/', {
      recipe: recipeId,
      comment_text: commentText,
    });
    return response.data;
  },

  /**
   * Delete a comment (admin only)
   */
  deleteComment: async (commentId) => {
    const response = await api.delete(`/recipes/comments/${commentId}/`);
    return response.data;
  },
};

export default commentService;