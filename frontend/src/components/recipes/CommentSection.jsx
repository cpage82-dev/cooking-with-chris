/**
 * Comment Section Component
 * Display and manage recipe comments
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import commentService from '../../services/commentService';

const CommentSection = ({ recipeId }) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (recipeId) {
      fetchComments();
    }
  }, [recipeId]);

  const fetchComments = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await commentService.getComments(recipeId);
      console.log('Fetched comments:', data); // DEBUG
      
      // Handle if data is an array or has a results property
      if (Array.isArray(data)) {
        setComments(data);
      } else if (data && Array.isArray(data.results)) {
        setComments(data.results);
      } else {
        console.warn('Unexpected comments data format:', data);
        setComments([]);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
      console.error('Error details:', err.response?.data);
      setError('Failed to load comments.');
      setComments([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) {
      setError('Comment cannot be empty.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await commentService.createComment(recipeId, commentText.trim());
      setCommentText('');
      await fetchComments(); // Refresh comments
    } catch (err) {
      console.error('Error creating comment:', err);
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.detail || 'Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await commentService.deleteComment(commentId);
      await fetchComments(); // Refresh comments
    } catch (err) {
      console.error('Error deleting comment:', err);
      console.error('Error details:', err.response?.data);
      alert(err.response?.data?.detail || 'Failed to delete comment. Please try again.');
    }
  };

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
    } catch (err) {
      console.error('Error formatting timestamp:', err);
      return 'Invalid date';
    }
  };

  // Don't render if no recipeId
  if (!recipeId) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <h2 className="text-2xl font-bold mb-4">Comments</h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-2xl font-bold mb-4">
        Comments ({Array.isArray(comments) ? comments.length : 0})
      </h2>

      {/* Comment Form - Only for authenticated users */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Leave a Comment
            </label>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share your thoughts about this recipe..."
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={submitting}
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !commentText.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800">
            Please{' '}
            <a href="/login" className="underline font-semibold">
              log in
            </a>{' '}
            to leave a comment.
          </p>
        </div>
      )}

      {/* Comments List */}
      {!Array.isArray(comments) || comments.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            No comments yet. Be the first to share your thoughts!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-800">
                    {comment.user_name || 'Anonymous'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatTimestamp(comment.created_at)}
                  </p>
                </div>

                {/* Delete button - only for admins */}
                {comment.can_delete && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                )}
              </div>

              <p className="text-gray-700 whitespace-pre-line">
                {comment.comment_text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;