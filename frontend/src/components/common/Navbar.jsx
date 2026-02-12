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
          {/* Logo + Brand */}
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="https://res.cloudinary.com/cookingwithchris/image/upload/v1770841614/cooking-with-chris-logo-v3_c6eh2q.png"
              alt="Cooking with Chris Logo"
              className="h-14 w-auto object-contain"
            />
            <span className="text-2xl font-bold text-blue-600">
              Cooking with Chris
            </span>
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
                  {/* ✅ Welcome message with clickable, underlined name */}
                  <span className="text-gray-600 flex items-center gap-1">
                    <span aria-hidden>👤</span>
                    <span>Welcome,</span>
                    <Link
                      to="/profile"
                      className="underline underline-offset-4 decoration-2 hover:text-gray-900 transition"
                    >
                      {user?.first_name} {user?.last_name}
                    </Link>
                    <span>!</span>
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
                {/*
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
                */}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
