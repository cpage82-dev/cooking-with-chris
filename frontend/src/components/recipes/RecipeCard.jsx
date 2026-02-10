/**
 * Recipe Card Component
 * Displays recipe summary in grid/list view
 */
import { Link } from 'react-router-dom';

const RecipeCard = ({ recipe }) => {
  return (
    <Link
      to={`/recipes/${recipe.id}`}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      {/* Recipe Image */}
      <div className="h-48 bg-gray-200 overflow-hidden">
        {recipe.thumbnail_url ? (
          <img
            src={recipe.thumbnail_url}
            alt={recipe.recipe_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-4xl">🍳</span>
          </div>
        )}
      </div>

      {/* Recipe Info */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
          {recipe.recipe_name}
        </h3>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            {recipe.course_type}
          </span>
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
            {recipe.recipe_type}
          </span>
          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
            {recipe.ethnic_style}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>⏱️ {recipe.total_time} min</span>
            <span>🍽️ {recipe.number_servings} servings</span>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-2">
          By {recipe.creator_name}
        </p>
      </div>
    </Link>
  );
};

export default RecipeCard;