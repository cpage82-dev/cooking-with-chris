/**
 * Navigation Bar Component
 */
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-blue-600">
            Cooking with Chris
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link
              to="/recipes"
              className="text-gray-700 hover:text-blue-600 transition"
            >
              View All Recipes
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/recipes/new"
                  role="button"
                  className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 transition focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >   
                  Create a Recipe
                </Link>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600">
                    <p>Welcome, {user?.first_name} {user?.last_name}!</p>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 transition"
                >
                  Login
                </Link>
                {/* Registration disabled - admins create users manually */}
                {/* <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link> */}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;