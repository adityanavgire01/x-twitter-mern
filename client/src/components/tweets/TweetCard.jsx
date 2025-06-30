import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth';
import { DEFAULT_AVATAR } from '../../constants/defaults.jsx';
import './Tweets.css';

const TweetCard = ({ tweet, onLike, onRetweet, onReply, showActions = true }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    onReply(tweet._id, replyContent);
    setReplyContent('');
    setIsReplying(false);
  };

  const handleTweetClick = (e) => {
    // Don't navigate if clicking on a link or button
    if (e.target.closest('a') || e.target.closest('button')) {
      return;
    }
    navigate(`/tweet/${tweet._id}`);
  };

  const getMediaLayoutClass = (mediaCount) => {
    switch (mediaCount) {
      case 1: return 'single';
      case 2: return 'double';
      case 3: return 'triple';
      case 4: return 'quad';
      default: return '';
    }
  };

  return (
    <div className="tweet-card" onClick={handleTweetClick}>
      <div className="tweet-header">
        <Link to={`/profile/${tweet.author._id}`} className="author-link" onClick={e => e.stopPropagation()}>
          <div className="profile-pic">
            <img 
              src={tweet.author.profileImage || DEFAULT_AVATAR} 
              alt={tweet.author.username} 
              className="author-avatar"
            />
          </div>
          <div className="tweet-author-info">
            <span className="author-name">{tweet.author.name}</span>
            <span className="author-username">@{tweet.author.username}</span>
            <span className="tweet-date">· {formatDate(tweet.createdAt)}</span>
          </div>
        </Link>
      </div>
      
      <div className="tweet-content">
        <p>{tweet.content}</p>
        {tweet.media && tweet.media.length > 0 && (
          <div className={`tweet-media ${getMediaLayoutClass(tweet.media.length)}`}>
            {tweet.media.map((url, index) => (
              <img 
                key={index} 
                src={url} 
                alt={`Tweet media ${index + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(url, '_blank');
                }}
              />
            ))}
          </div>
        )}
      </div>

      {showActions && (
        <div className="tweet-actions">
          <button 
            className={`action-button reply-button ${isReplying ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsReplying(!isReplying);
            }}
          >
            <i className="far fa-comment"></i>
            <span>{tweet.replies?.length || 0}</span>
          </button>
          <button 
            className={`action-button retweet-button ${tweet.retweets?.includes(user._id) ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onRetweet(tweet._id);
            }}
          >
            <i className="fas fa-retweet"></i>
            <span>{tweet.retweets?.length || 0}</span>
          </button>
          <button 
            className={`action-button like-button ${tweet.likes?.includes(user._id) ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onLike(tweet._id);
            }}
          >
            <i className="far fa-heart"></i>
            <span>{tweet.likes?.length || 0}</span>
          </button>
        </div>
      )}

      {isReplying && (
        <div className="reply-section" onClick={e => e.stopPropagation()}>
          <form onSubmit={handleReplySubmit}>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Tweet your reply"
              maxLength={280}
            />
            <div className="reply-actions">
              <span className="character-count">{280 - replyContent.length}</span>
              <button type="submit" disabled={!replyContent.trim()}>
                Reply
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TweetCard; 