/**
 * Home Page
 */
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="text-center">
      <h1 className="text-5xl font-bold text-gray-800 mb-4">
        Welcome to Cooking with Chris
      </h1>
      
      {isAuthenticated ? (
        <p className="text-xl text-gray-600 mb-8">
          Hello, {user?.first_name}! Ready to cook something delicious?
        </p>
      ) : (
        <p className="text-xl text-gray-600 mb-8">
          Discover and share amazing recipes
        </p>
      )}

      <div className="flex justify-center space-x-4">
        <Link
          to="/recipes"
          className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700 transition"
        >
          Browse Recipes
        </Link>
        
        {isAuthenticated && (
          <Link
            to="/recipes/new"
            className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-green-700 transition"
          >
            Create Recipe
          </Link>
        )}
        
        {/* Registration disabled - admins create users manually */}
        {/* {!isAuthenticated && (
          <Link
            to="/register"
            className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-green-700 transition"
          >
            Sign Up
          </Link>
        )} */}
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-bold mb-2">Browse Recipes</h3>
          <p className="text-gray-600">
            Explore thousands of delicious recipes from around the world
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-bold mb-2">Share Your Recipes</h3>
          <p className="text-gray-600">
            Upload your own recipes and share them with the community
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-bold mb-2">Save Favorites</h3>
          <p className="text-gray-600">
            Bookmark your favorite recipes for easy access later
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;