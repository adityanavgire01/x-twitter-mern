import { Link } from 'react-router-dom';
import { useAuth } from '../../context/auth';
import axios from '../../config/axios';
import { useState } from 'react';
import './Search.css';

const UserCard = ({ user }) => {
  const { user: currentUser } = useAuth();
  const [isFollowing, setIsFollowing] = useState(
    user.followers?.includes(currentUser?._id)
  );

  const handleFollow = async () => {
    try {
      await axios.post(`/users/${user.username}/follow`);
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  return (
    <div className="user-card">
      <Link to={`/${user.username}`} className="user-info">
        <div className="user-avatar">
          <img
            src={user.profileImage || 'https://via.placeholder.com/50'}
            alt={user.username}
            className="avatar-image"
          />
        </div>
        <div className="user-details">
          <div className="user-name">{user.name}</div>
          <div className="user-username">@{user.username}</div>
          <div className="user-bio">{user.bio}</div>
        </div>
      </Link>
      {currentUser?._id !== user._id && (
        <button
          className={`follow-button ${isFollowing ? 'following' : ''}`}
          onClick={handleFollow}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      )}
    </div>
  );
};

export default UserCard; 