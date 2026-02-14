/**
 * Navigation Bar Component (Mobile-friendly)
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate('/login');
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        {/* Top Row */}
        <div className="flex items-center justify-between py-3">
          {/* Logo + Brand */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src="https://res.cloudinary.com/cookingwithchris/image/upload/v1770841614/cooking-with-chris-logo-v3_c6eh2q.png"
              alt="Cooking with Chris Logo"
              className="h-10 sm:h-14 w-auto object-contain"
            />
            <span className="font-bold text-blue-600 text-lg sm:text-2xl">
              <span className="hidden sm:inline">Cooking with Chris</span>
              <span className="sm:hidden">CwC</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden sm:flex items-center space-x-6">
            <Link
              to="/recipes"
              className="text-gray-700 hover:text-blue-600 transition"
            >
              View All Recipes
            </Link>

            {isAuthenticated && (
              <Link
                to="/my-recipes"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                View My Recipes
              </Link>
            )}

            {isAuthenticated ? (
              <>
                <Link
                  to="/recipes/new"
                  role="button"
                  className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 transition focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Create a Recipe
                </Link>

                <span className="text-gray-600 flex items-center gap-1">
                  <span aria-hidden>👤</span>
                  <span>Welcome,</span>
                  <Link
                    to="/profile"
                    className="underline underline-offset-4 decoration-2 hover:text-gray-900 transition"
                  >
                    {user?.first_name}
                  </Link>
                  <span>!</span>
                </span>

                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            type="button"
            className="sm:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 transition"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="text-2xl leading-none" aria-hidden>
              {menuOpen ? '✕' : '☰'}
            </span>
          </button>
        </div>

        {/* Mobile Menu Panel */}
        {menuOpen && (
          <div className="sm:hidden pb-4">
            <div className="flex flex-col gap-3 border-t pt-4">
              <Link
                to="/recipes"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                View All Recipes
              </Link>

              {isAuthenticated && (
                <Link
                  to="/my-recipes"
                  className="text-gray-700 hover:text-blue-600 transition"
                >
                  View My Recipes
                </Link>
              )}

              {isAuthenticated ? (
                <>
                  <Link
                    to="/recipes/new"
                    role="button"
                    className="inline-flex justify-center items-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 transition focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Create a Recipe
                  </Link>

                  <Link
                    to="/profile"
                    className="text-gray-700 hover:text-blue-600 transition flex items-center gap-2"
                  >
                    <span aria-hidden>👤</span>
                    <span className="underline underline-offset-4 decoration-2">
                      {user?.first_name}
                    </span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 transition"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
