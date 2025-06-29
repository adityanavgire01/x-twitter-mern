import { useState, useEffect } from 'react';
import { useAuth } from '../../context/auth';
import axios from '../../config/axios';
import CreateTweet from './CreateTweet';
import TweetCard from './TweetCard';
import './Tweets.css';

const TweetFeed = () => {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchTweets = async () => {
    try {
      const response = await axios.get('/tweets/feed');
      setTweets(response.data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch tweets. Please try again later.');
      console.error('Error fetching tweets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTweets();
  }, []);

  const handleCreateTweet = async (content) => {
    try {
      const response = await axios.post('/tweets', { content });
      setTweets([response.data, ...tweets]);
    } catch (error) {
      setError('Failed to create tweet. Please try again.');
      console.error('Error creating tweet:', error);
    }
  };

  const handleLike = async (tweetId) => {
    try {
      await axios.post(`/tweets/${tweetId}/like`);
      const updatedTweets = tweets.map(tweet => 
        tweet._id === tweetId 
          ? { ...tweet, likes: tweet.likes.includes(user._id) 
              ? tweet.likes.filter(id => id !== user._id)
              : [...tweet.likes, user._id] }
          : tweet
      );
      setTweets(updatedTweets);
    } catch (error) {
      setError('Failed to like tweet. Please try again.');
      console.error('Error liking tweet:', error);
    }
  };

  const handleRetweet = async (tweetId) => {
    try {
      await axios.post(`/tweets/${tweetId}/retweet`);
      const updatedTweets = tweets.map(tweet =>
        tweet._id === tweetId
          ? { ...tweet, retweets: tweet.retweets.includes(user._id)
              ? tweet.retweets.filter(id => id !== user._id)
              : [...tweet.retweets, user._id] }
          : tweet
      );
      setTweets(updatedTweets);
    } catch (error) {
      setError('Failed to retweet. Please try again.');
      console.error('Error retweeting:', error);
    }
  };

  const handleReply = async (tweetId, content) => {
    try {
      const response = await axios.post(`/tweets/${tweetId}/reply`, { content });
      const updatedTweets = tweets.map(tweet =>
        tweet._id === tweetId
          ? { ...tweet, replies: [...tweet.replies, response.data] }
          : tweet
      );
      setTweets(updatedTweets);
    } catch (error) {
      setError('Failed to reply to tweet. Please try again.');
      console.error('Error replying to tweet:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading tweets...</div>;
  }

  return (
    <div className="tweet-feed">
      {error && <div className="error-message">{error}</div>}
      <CreateTweet onTweetCreate={handleCreateTweet} />
      <div className="tweets-list">
        {tweets.map(tweet => (
          <TweetCard
            key={tweet._id}
            tweet={tweet}
            onLike={handleLike}
            onRetweet={handleRetweet}
            onReply={handleReply}
          />
        ))}
      </div>
    </div>
  );
};

export default TweetFeed; 