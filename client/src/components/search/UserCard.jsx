import { Link } from 'react-router-dom';
import { useAuth } from '../../context/auth';
import { DEFAULT_AVATAR } from '../../constants/defaults.jsx';
import './Search.css';

const UserCard = ({ user: searchedUser, onFollow }) => {
  const { user } = useAuth();
  const isFollowing = searchedUser.followers?.includes(user._id);
  const isCurrentUser = searchedUser._id === user._id;

  return (
    <div className="user-card">
      <Link to={`/profile/${searchedUser.username}`} className="user-info">
        <div className="user-avatar">
          <img 
            src={searchedUser.profileImage || DEFAULT_AVATAR} 
            alt={searchedUser.username} 
          />
        </div>
        <div className="user-details">
          <h3 className="user-name">{searchedUser.name}</h3>
          <p className="user-username">@{searchedUser.username}</p>
          <p className="user-bio">{searchedUser.bio || 'No bio yet'}</p>
        </div>
      </Link>
      {!isCurrentUser && (
        <button 
          className={`follow-button ${isFollowing ? 'following' : ''}`}
          onClick={() => onFollow(searchedUser._id)}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      )}
    </div>
  );
};

export default UserCard; 