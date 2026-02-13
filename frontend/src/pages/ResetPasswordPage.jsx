/**
 * Reset Password Page
 * Set new password using reset token from email
 */
import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import authService from '../services/authService';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    password_confirm: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  // Validation
  if (formData.password.length < 8) {
    setError('Password must be at least 8 characters long.');
    return;
  }

  if (formData.password !== formData.password_confirm) {
    setError('Passwords do not match.');
    return;
  }

  if (!token) {
    setError('Invalid reset link. Please request a new password reset.');
    return;
  }

  setLoading(true);

  try {
    // Backend expects: token, new_password, confirm_password
    await authService.resetPassword(
      token, 
      formData.password,
      formData.password_confirm  // ← Add confirm password
    );
    
    // Success - redirect to login with message
    navigate('/login', {
      state: { message: 'Password reset successful! Please login with your new password.' }
    });
  } catch (err) {
    console.error('Password reset error:', err);
    if (err.response?.data?.error) {
      setError(err.response.data.error);
    } else {
      setError('Failed to reset password. Please try again or request a new reset link.');
    }
  } finally {
    setLoading(false);
  }
};

  // If no token, show error
  if (!token) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Invalid Reset Link</h1>
            <p className="text-gray-600 mb-6">
              This password reset link is invalid or missing the required token.
            </p>
          </div>

          <Link
            to="/forgot-password"
            className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          Set New Password
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Enter your new password below.
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              New Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Enter new password"
              required
              minLength={8}
            />
            <p className="text-sm text-gray-500 mt-1">
              Must be at least 8 characters long
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              name="password_confirm"
              value={formData.password_confirm}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Confirm new password"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-blue-600 hover:underline">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;