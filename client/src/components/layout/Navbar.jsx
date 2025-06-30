import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth';
import { DEFAULT_AVATAR } from '../../constants/defaults.jsx';
import './Navbar.css';

// Utility function to format profile image URLs
const formatImageUrl = (url) => {
  if (!url || url.startsWith('http')) return url;
  return `http://localhost:5000${url}`;
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/" className="brand-link">
            <i className="fab fa-twitter"></i>
          </Link>
        </div>

        <div className="nav-links">
          <Link to="/" className="nav-link">
            <i className="fas fa-home"></i>
            <span>Home</span>
          </Link>
          <Link to="/search" className="nav-link">
            <i className="fas fa-search"></i>
            <span>Search</span>
          </Link>
          <Link to={`/profile/${user.username}`} className="nav-link">
            <i className="fas fa-user"></i>
            <span>Profile</span>
          </Link>
          <button onClick={logout} className="nav-link logout-button">
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>

        <div className="nav-user">
          <div className="user-info" onClick={() => navigate(`/profile/${user.username}`)}>
            <img
              src={formatImageUrl(user.profileImage) || DEFAULT_AVATAR}
              alt={user.displayName || user.name}
              className="user-avatar"
            />
            <div className="user-details">
              <span className="user-name">{user.displayName || user.name}</span>
              <span className="user-username">@{user.username}</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 