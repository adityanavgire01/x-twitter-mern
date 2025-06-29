import { useState } from 'react';
import { useAuth } from '../../context/auth';
import './Tweets.css';

const TweetCard = ({ tweet, onLike, onRetweet, onReply }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const { user } = useAuth();

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

  return (
    <div className="tweet-card">
      <div className="tweet-header">
        <img 
          src={tweet.author.profileImage || 'https://via.placeholder.com/40'} 
          alt={tweet.author.username} 
          className="profile-pic"
        />
        <div className="tweet-author-info">
          <span className="author-name">{tweet.author.name}</span>
          <span className="author-username">@{tweet.author.username}</span>
          <span className="tweet-date">· {formatDate(tweet.createdAt)}</span>
        </div>
      </div>
      
      <div className="tweet-content">
        <p>{tweet.content}</p>
      </div>

      <div className="tweet-actions">
        <button 
          className={`action-button reply-button ${isReplying ? 'active' : ''}`}
          onClick={() => setIsReplying(!isReplying)}
        >
          <i className="far fa-comment"></i>
          <span>{tweet.replies?.length || 0}</span>
        </button>

        <button 
          className={`action-button retweet-button ${tweet.retweets?.includes(user?._id) ? 'active' : ''}`}
          onClick={() => onRetweet(tweet._id)}
        >
          <i className="fas fa-retweet"></i>
          <span>{tweet.retweets?.length || 0}</span>
        </button>

        <button 
          className={`action-button like-button ${tweet.likes?.includes(user?._id) ? 'active' : ''}`}
          onClick={() => onLike(tweet._id)}
        >
          <i className="far fa-heart"></i>
          <span>{tweet.likes?.length || 0}</span>
        </button>
      </div>

      {isReplying && (
        <form onSubmit={handleReplySubmit} className="reply-form">
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
      )}
    </div>
  );
};

export default TweetCard; 