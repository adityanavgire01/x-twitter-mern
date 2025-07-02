import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/auth';
import axios from '../../config/axios';
import TweetCard from '../tweets/TweetCard';
import ProfilePicture from './ProfilePicture';
import EditProfile from './EditProfile';
import { DEFAULT_PROFILE_IMAGE, DEFAULT_BANNER_IMAGE } from '../../constants/defaults.jsx';
import './Profile.css';

const Profile = () => {
  const { identifier } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [stats, setStats] = useState({
    followers: 0,
    following: 0,
    tweets: 0
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, tweetsRes] = await Promise.all([
          axios.get(`/users/${identifier}`),
          axios.get(`/users/${identifier}/tweets`)
        ]);
        setProfile(profileRes.data);
        setTweets(tweetsRes.data);
        setStats({
          followers: profileRes.data.followers?.length || 0,
          following: profileRes.data.following?.length || 0,
          tweets: tweetsRes.data.length
        });
      } catch (error) {
        setError('Failed to load profile');
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (identifier) {
      fetchProfile();
    }
  }, [identifier]);

  const handleFollow = async () => {
    try {
      const response = await axios.post(`/users/${identifier}/follow`);
      setProfile(prev => ({
        ...prev,
        followers: response.data.followers
      }));
      setStats(prev => ({
        ...prev,
        followers: response.data.followers.length
      }));
    } catch (error) {
      setError('Failed to follow user');
      console.error('Error following user:', error);
    }
  };

  const handleProfileUpdate = (profileImage) => {
    setProfile(prev => ({
      ...prev,
      profileImage
    }));
  };

  const handleProfileEdit = (updatedProfile) => {
    // Update local profile state
    setProfile(prev => ({
      ...prev,
      ...updatedProfile
    }));
    
    // If this is the current user's profile, update auth context
    if (currentUser && (currentUser._id === profile._id || currentUser.username === profile.username)) {
      updateUser(updatedProfile);
    }
  };

  const handleLike = async (tweetId) => {
    try {
      await axios.post(`/tweets/${tweetId}/like`);
      setTweets(prev =>
        prev.map(tweet =>
          tweet._id === tweetId
            ? {
                ...tweet,
                likes: tweet.likes.includes(currentUser._id)
                  ? tweet.likes.filter(id => id !== currentUser._id)
                  : [...tweet.likes, currentUser._id]
              }
            : tweet
        )
      );
    } catch (error) {
      setError('Failed to like tweet');
      console.error('Error liking tweet:', error);
    }
  };

  const handleRetweet = async (tweetId) => {
    try {
      await axios.post(`/tweets/${tweetId}/retweet`);
      setTweets(prev =>
        prev.map(tweet =>
          tweet._id === tweetId
            ? {
                ...tweet,
                retweets: tweet.retweets.includes(currentUser._id)
                  ? tweet.retweets.filter(id => id !== currentUser._id)
                  : [...tweet.retweets, currentUser._id]
              }
            : tweet
        )
      );
    } catch (error) {
      setError('Failed to retweet');
      console.error('Error retweeting:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="error-message">User not found</div>;
  }

  const isFollowing = profile.followers?.includes(currentUser?._id);

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-banner">
          <img
            src={profile.bannerImage || DEFAULT_BANNER_IMAGE}
            alt="Profile banner"
            className="banner-image"
          />
        </div>
        <div className="profile-info">
          <ProfilePicture 
            profile={{
              ...profile,
              profileImage: profile.profileImage || DEFAULT_PROFILE_IMAGE
            }} 
            onUpdate={handleProfileUpdate} 
          />
          <div className="profile-details">
            <h1 className="profile-name">{profile.displayName || profile.name}</h1>
            <p className="profile-username">@{profile.username}</p>
            <p className="profile-bio">{profile.bio || 'No bio yet'}</p>
            
            {/* Location and Website */}
            {(profile.location || profile.website) && (
              <div className="profile-additional-info">
                {profile.location && (
                  <span className="profile-location">
                    <i className="fas fa-map-marker-alt"></i>
                    {profile.location}
                  </span>
                )}
                {profile.website && (
                  <span className="profile-website">
                    <i className="fas fa-link"></i>
                    <a href={profile.website} target="_blank" rel="noopener noreferrer">
                      {profile.website}
                    </a>
                  </span>
                )}
              </div>
            )}
            
            <div className="profile-stats">
              <span><strong>{stats.following}</strong> Following</span>
              <span><strong>{stats.followers}</strong> Followers</span>
              <span><strong>{stats.tweets}</strong> Tweets</span>
            </div>
          </div>
          {currentUser?._id === profile._id ? (
            <button
              className="edit-profile-button"
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Profile
            </button>
          ) : (
            <button
              className={`follow-button ${isFollowing ? 'following' : ''}`}
              onClick={handleFollow}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="profile-tweets">
        {tweets.map(tweet => (
          <TweetCard
            key={tweet._id}
            tweet={tweet}
            onLike={handleLike}
            onRetweet={handleRetweet}
          />
        ))}
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <EditProfile
          profile={profile}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleProfileEdit}
        />
      )}
    </div>
  );
};

export default Profile; 