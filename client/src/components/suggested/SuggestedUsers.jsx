import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../config/axios';
import { useAuth } from '../../context/auth';
import { DEFAULT_AVATAR } from '../../constants/defaults.jsx';
import './SuggestedUsers.css';

// Utility function to format profile image URLs
const formatImageUrl = (url) => {
  if (!url || url.startsWith('http')) return url;
  return `http://localhost:5000${url}`;
};

const SuggestedUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // Use updated profile image from auth context if this user is the current user
  const getUserProfileImage = (user) => {
    if (currentUser && (user._id === currentUser._id || user.username === currentUser.username)) {
      return formatImageUrl(currentUser.profileImage) || DEFAULT_AVATAR;
    }
    return user.profileImage || DEFAULT_AVATAR;
  };

  const fetchSuggestedUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/users/suggested?limit=5`);
      const { users: newUsers, hasMore: moreAvailable } = response.data;

      setUsers(newUsers);
      setHasMore(moreAvailable);
      setError(null);
    } catch (error) {
      setError('Failed to load suggested users');
      console.error('Error fetching suggested users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMoreUsers = async () => {
    try {
      setLoadingMore(true);
      const response = await axios.get(`/users/suggested?limit=5`);
      const { users: newUsers, hasMore: moreAvailable } = response.data;

      setUsers(newUsers); // Replace with new random users
      setHasMore(moreAvailable);
      setError(null);
    } catch (error) {
      setError('Failed to load more users');
      console.error('Error fetching more users:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchSuggestedUsers();
  }, []);

  const handleMoreUsers = () => {
    fetchMoreUsers(); // Get new random users
  };

  const handleUserClick = (username) => {
    navigate(`/profile/${username}`);
  };

  const handleFollow = async (userId, e) => {
    e.stopPropagation(); // Prevent navigation when clicking follow button
    try {
      await axios.post(`/users/${userId}/follow`);
      // Remove followed user from the list
      setUsers(prev => prev.filter(user => user._id !== userId));
      
      // If we have less than 3 users now and there are more available, fetch more
      if (users.length <= 2 && hasMore) {
        fetchSuggestedUsers();
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  if (loading) {
    return (
      <div className="suggested-users-card">
        <div className="suggested-users-header">
          <h3>Who to follow</h3>
        </div>
        <div className="loading">Loading suggestions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="suggested-users-card">
        <div className="suggested-users-header">
          <h3>Who to follow</h3>
        </div>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="suggested-users-card">
        <div className="suggested-users-header">
          <h3>Who to follow</h3>
        </div>
        <div className="no-suggestions">
          You're following everyone! 🎉
        </div>
      </div>
    );
  }

  return (
    <div className="suggested-users-card">
      <div className="suggested-users-header">
        <h3>Who to follow</h3>
      </div>
      
      <div className="suggested-users-list">
        {users.map((user) => (
          <div 
            key={user._id} 
            className="suggested-user-item"
            onClick={() => handleUserClick(user.username)}
          >
            <div className="user-info">
              <img
                src={getUserProfileImage(user)}
                alt={user.username}
                className="user-avatar"
              />
              <div className="user-details">
                <div className="user-name">{user.displayName || user.username}</div>
                <div className="user-username">@{user.username}</div>
                {user.bio && (
                  <div className="user-bio">{user.bio.slice(0, 50)}{user.bio.length > 50 ? '...' : ''}</div>
                )}
                <div className="user-followers">
                  {user.followers?.length || 0} followers
                </div>
              </div>
            </div>
            <button
              className="follow-btn"
              onClick={(e) => handleFollow(user._id, e)}
            >
              Follow
            </button>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="suggested-users-footer">
          <button 
            className="more-users-btn"
            onClick={handleMoreUsers}
            disabled={loadingMore}
          >
            {loadingMore ? 'Loading...' : 'More users'}
          </button>
        </div>
      )}
    </div>
  );
};

export default SuggestedUsers; 