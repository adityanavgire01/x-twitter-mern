import { useState } from 'react';
import { useAuth } from '../../context/auth';
import './Tweets.css';

const CreateTweet = ({ onTweetCreate }) => {
  const [content, setContent] = useState('');
  const { user } = useAuth();
  const maxLength = 280;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      onTweetCreate(content);
      setContent('');
    }
  };

  return (
    <div className="create-tweet">
      <div className="create-tweet-header">
        <img 
          src={user?.profileImage || 'https://via.placeholder.com/40'} 
          alt={user?.username} 
          className="profile-pic"
        />
        <form onSubmit={handleSubmit} className="tweet-form">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            maxLength={maxLength}
          />
          <div className="tweet-form-actions">
            <span className="character-count">
              {maxLength - content.length}
            </span>
            <button 
              type="submit" 
              className="tweet-button"
              disabled={!content.trim()}
            >
              Tweet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTweet; 