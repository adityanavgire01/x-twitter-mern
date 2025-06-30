import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth';
import axios from '../../config/axios';
import TweetCard from './TweetCard';
import './Tweets.css';

const TweetDetail = () => {
  const { tweetId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tweet, setTweet] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    const fetchTweetAndReplies = async () => {
      try {
        const [tweetRes, repliesRes] = await Promise.all([
          axios.get(`/tweets/${tweetId}`),
          axios.get(`/tweets/${tweetId}/replies`)
        ]);
        setTweet(tweetRes.data);
        setReplies(repliesRes.data);
      } catch (error) {
        setError('Failed to load tweet');
        console.error('Error loading tweet:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTweetAndReplies();
  }, [tweetId]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      const response = await axios.post(`/tweets/${tweetId}/reply`, {
        content: replyContent
      });
      setReplies(prev => [response.data, ...prev]);
      setReplyContent('');
    } catch (error) {
      setError('Failed to post reply');
      console.error('Error posting reply:', error);
    }
  };

  const handleLike = async () => {
    try {
      await axios.post(`/tweets/${tweetId}/like`);
      setTweet(prev => ({
        ...prev,
        likes: prev.likes.includes(user._id)
          ? prev.likes.filter(id => id !== user._id)
          : [...prev.likes, user._id]
      }));
    } catch (error) {
      setError('Failed to like tweet');
      console.error('Error liking tweet:', error);
    }
  };

  const handleRetweet = async () => {
    try {
      await axios.post(`/tweets/${tweetId}/retweet`);
      setTweet(prev => ({
        ...prev,
        retweets: prev.retweets.includes(user._id)
          ? prev.retweets.filter(id => id !== user._id)
          : [...prev.retweets, user._id]
      }));
    } catch (error) {
      setError('Failed to retweet');
      console.error('Error retweeting:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading tweet...</div>;
  }

  if (!tweet) {
    return <div className="error-message">Tweet not found</div>;
  }

  return (
    <div className="tweet-detail">
      <div className="tweet-detail-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-left"></i>
          <span>Back</span>
        </button>
        <h2>Tweet</h2>
      </div>

      <div className="main-tweet">
        <TweetCard
          tweet={tweet}
          onLike={handleLike}
          onRetweet={handleRetweet}
          showActions={true}
        />
      </div>

      <div className="reply-compose">
        <img
          src={user.profileImage || 'https://via.placeholder.com/40'}
          alt={user.username}
          className="profile-pic"
        />
        <form onSubmit={handleReply} className="reply-form">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Tweet your reply"
            maxLength={280}
          />
          <div className="reply-actions">
            <span className="character-count">
              {280 - replyContent.length}
            </span>
            <button
              type="submit"
              disabled={!replyContent.trim()}
              className="reply-button"
            >
              Reply
            </button>
          </div>
        </form>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="replies-section">
        <h3>Replies</h3>
        {replies.map(reply => (
          <TweetCard
            key={reply._id}
            tweet={reply}
            onLike={handleLike}
            onRetweet={handleRetweet}
          />
        ))}
        {replies.length === 0 && (
          <div className="no-replies">No replies yet</div>
        )}
      </div>
    </div>
  );
};

export default TweetDetail; 