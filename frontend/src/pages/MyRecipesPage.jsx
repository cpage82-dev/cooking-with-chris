/**
 * My Recipes Page
 * View recipes created by the current user
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import recipeService from '../services/recipeService';
import RecipeCard from '../components/recipes/RecipeCard';
import SearchBar from '../components/recipes/SearchBar';

const MyRecipesPage = () => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    course_type: '',
    recipe_type: '',
    primary_protein: '',
    ethnic_style: '',
  });

  useEffect(() => {
    fetchMyRecipes();
  }, [searchTerm, filters]);

  const fetchMyRecipes = async () => {
    setLoading(true);
    setError('');

    try {
      const params = {
        ...filters,
        uploaded_by: user?.id, // Filter by current user
        ...(searchTerm && { search: searchTerm }),
      };

      // Remove empty filters
      Object.keys(params).forEach((key) => {
        if (params[key] === '') delete params[key];
      });

      const data = await recipeService.getRecipes(params);
      setRecipes(data.results || data);
    } catch (err) {
      setError('Failed to load your recipes. Please try again.');
      console.error('Error fetching my recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      course_type: '',
      recipe_type: '',
      primary_protein: '',
      ethnic_style: '',
    });
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Recipes</h1>
          <p className="text-gray-600 mt-1">Recipes You've Created</p>
        </div>
        <div className="text-right">
          <p className="text-gray-600">{recipes.length} recipe{recipes.length !== 1 ? 's' : ''} found</p>
        </div>
      </div>

      {/* Search Bar */}
      <SearchBar onSearch={handleSearch} />

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Course Type Filter */}
          <select
            value={filters.course_type}
            onChange={(e) => handleFilterChange('course_type', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Courses</option>
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Hors d'oeuvres">Hors d'oeuvres</option>
            <option value="Appetizer">Appetizer</option>
            <option value="Dinner">Dinner</option>
            <option value="Dessert">Dessert</option>
          </select>

          {/* Recipe Type Filter */}
          <select
            value={filters.recipe_type}
            onChange={(e) => handleFilterChange('recipe_type', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Types</option>
            <option value="Entrée">Entrée</option>
            <option value="Soup">Soup</option>
            <option value="Salad">Salad</option>
            <option value="Pizza">Pizza</option>
            <option value="Starter">Starter</option>
            <option value="Side Dish">Side Dish</option>
            <option value="Sauce">Sauce</option>
          </select>

          {/* Protein Filter */}
          <select
            value={filters.primary_protein}
            onChange={(e) => handleFilterChange('primary_protein', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Proteins</option>
            <option value="Beef">Beef</option>
            <option value="Chicken">Chicken</option>
            <option value="Fish">Fish</option>
            <option value="Pork">Pork</option>
            <option value="Turkey">Turkey</option>
            <option value="Vegetarian / None">Vegetarian / None</option>
          </select>

          {/* Ethnic Style Filter */}
          <select
            value={filters.ethnic_style}
            onChange={(e) => handleFilterChange('ethnic_style', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Cuisines</option>
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

        {/* Clear Filters Button */}
        {(filters.course_type || filters.recipe_type || filters.primary_protein || filters.ethnic_style || searchTerm) && (
          <button
            onClick={clearFilters}
            className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Recipe Grid */}
      {recipes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <div className="text-6xl mb-4">📖</div>
          <p className="text-gray-600 text-lg mb-4">
            {searchTerm || Object.values(filters).some(f => f) 
              ? "No recipes found matching your filters."
              : "You haven't created any recipes yet!"}
          </p>
          <Link
            to="/recipes/new"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Create Your First Recipe
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRecipesPage;