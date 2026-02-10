/**
 * Recipe Detail Page
 * View full recipe with ingredients and instructions
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import recipeService from '../services/recipeService';

const RecipeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await recipeService.getRecipe(id);
      setRecipe(data);
    } catch (err) {
      setError('Recipe not found or failed to load.');
      console.error('Error fetching recipe:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await recipeService.deleteRecipe(id);
      navigate('/recipes', {
        state: { message: 'Recipe deleted successfully' },
      });
    } catch (err) {
      setError('Failed to delete recipe. Please try again.');
      console.error('Error deleting recipe:', err);
    }
  };

  const canEdit = isAuthenticated && user && recipe && (
    user.id === recipe.creator_id || user.is_admin
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Recipe not found'}
        </div>
        <Link
          to="/recipes"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          ← Back to recipes
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/recipes"
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          ← Back to recipes
        </Link>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {recipe.recipe_name}
            </h1>
            <p className="text-gray-600">By {recipe.creator_name} | Created {recipe.created_at}</p>
          </div>

          {canEdit && (
            <div className="flex gap-2">
              <Link
                to={`/recipes/${id}/edit`}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Edit
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
            <h3 className="text-xl font-bold mb-4">Delete Recipe?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{recipe.recipe_name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recipe Image */}
      {recipe.recipe_image && (
        <div className="mb-6 rounded-lg overflow-hidden shadow-lg">
          <img
            src={recipe.recipe_image}
            alt={recipe.recipe_name}
            className="w-full h-96 object-cover"
          />
        </div>
      )}

      {/* Recipe Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <p className="text-gray-600 text-sm">Course</p>
          <p className="font-bold text-lg">{recipe.course_type}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <p className="text-gray-600 text-sm">Type</p>
          <p className="font-bold text-lg">{recipe.recipe_type}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <p className="text-gray-600 text-sm">Protein</p>
          <p className="font-bold text-lg">{recipe.primary_protein}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <p className="text-gray-600 text-sm">Cuisine</p>
          <p className="font-bold text-lg">{recipe.ethnic_style}</p>
        </div>
      </div>

      {/* Time and Servings */}
      <div className="bg-blue-50 p-6 rounded-lg mb-6">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-blue-800 font-semibold text-sm">Prep Time</p>
            <p className="text-2xl font-bold text-blue-900">{recipe.prep_time} min</p>
          </div>
          <div>
            <p className="text-blue-800 font-semibold text-sm">Cook Time</p>
            <p className="text-2xl font-bold text-blue-900">{recipe.cook_time} min</p>
          </div>
          <div>
            <p className="text-blue-800 font-semibold text-sm">Total Time</p>
            <p className="text-2xl font-bold text-blue-900">{recipe.total_time} min</p>
          </div>
          <div>
            <p className="text-blue-800 font-semibold text-sm">Servings</p>
            <p className="text-2xl font-bold text-blue-900">{recipe.number_servings}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-bold mb-3">Description</h2>
        <p className="text-gray-700 leading-relaxed">{recipe.recipe_description}</p>
      </div>

      {/* Ingredients */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-bold mb-4">Ingredients</h2>
        {recipe.ingredient_sections && recipe.ingredient_sections.length > 0 ? (
          recipe.ingredient_sections.map((section) => (
            <div key={section.id} className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {section.section_title}
              </h3>
              <ul className="space-y-2">
                {section.ingredients.map((ingredient) => (
                  <li key={ingredient.id} className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span className="text-gray-700">
                      {ingredient.ingredient_quantity && (
                        <span className="font-semibold">{ingredient.ingredient_quantity} </span>
                      )}
                      {ingredient.ingredient_uom && (
                        <span className="font-semibold">{ingredient.ingredient_uom} </span>
                      )}
                      {ingredient.ingredient_name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No ingredients listed</p>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-bold mb-4">Instructions</h2>
        {recipe.instruction_sections && recipe.instruction_sections.length > 0 ? (
          recipe.instruction_sections.map((section) => (
            <div key={section.id} className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {section.section_title}
              </h3>
              <ol className="space-y-4">
                {section.instructions.map((instruction) => (
                  <li key={instruction.id} className="flex">
                    <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0 font-bold">
                      {instruction.step_order}
                    </span>
                    <p className="text-gray-700 pt-1">{instruction.instruction_step}</p>
                  </li>
                ))}
              </ol>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No instructions listed</p>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-6">
        <Link
          to="/recipes"
          className="text-blue-600 hover:underline text-lg"
        >
          ← Browse more recipes
        </Link>
      </div>
    </div>
  );
};

export default RecipeDetailPage;