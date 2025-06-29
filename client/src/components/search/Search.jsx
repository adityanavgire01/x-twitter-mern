import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from '../../config/axios';
import { useAuth } from '../../context/auth';
import TweetCard from '../tweets/TweetCard';
import UserCard from './UserCard';
import './Search.css';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('tweets');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [tweets, setTweets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchTerm(query);
      performSearch(query);
    }
  }, [searchParams]);

  const performSearch = async (query) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const [tweetsRes, usersRes] = await Promise.all([
        axios.get(`/search/tweets?q=${encodeURIComponent(query)}`),
        axios.get(`/search/users?q=${encodeURIComponent(query)}`)
      ]);

      setTweets(tweetsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      setError('Failed to perform search');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setSearchParams({ q: searchTerm });
    performSearch(searchTerm);
  };

  const handleLike = async (tweetId) => {
    try {
      await axios.post(`/tweets/${tweetId}/like`);
      setTweets(prev =>
        prev.map(tweet =>
          tweet._id === tweetId
            ? {
                ...tweet,
                likes: tweet.likes.includes(user._id)
                  ? tweet.likes.filter(id => id !== user._id)
                  : [...tweet.likes, user._id]
              }
            : tweet
        )
      );
    } catch (error) {
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
                retweets: tweet.retweets.includes(user._id)
                  ? tweet.retweets.filter(id => id !== user._id)
                  : [...tweet.retweets, user._id]
              }
            : tweet
        )
      );
    } catch (error) {
      console.error('Error retweeting:', error);
    }
  };

  return (
    <div className="search-container">
      <div className="search-header">
        <div className="search-bar">
          <i className="fas fa-search search-icon"></i>
          <form onSubmit={handleSearch}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Twitter"
              className="search-input"
            />
          </form>
        </div>

        <div className="search-tabs">
          <button
            className={`tab-button ${activeTab === 'tweets' ? 'active' : ''}`}
            onClick={() => setActiveTab('tweets')}
          >
            Tweets
            {tweets.length > 0 && <span className="result-count">{tweets.length}</span>}
          </button>
          <button
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            People
            {users.length > 0 && <span className="result-count">{users.length}</span>}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Searching...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="search-results">
          {activeTab === 'tweets' ? (
            tweets.length > 0 ? (
              tweets.map(tweet => (
                <TweetCard
                  key={tweet._id}
                  tweet={tweet}
                  onLike={handleLike}
                  onRetweet={handleRetweet}
                />
              ))
            ) : (
              searchTerm && <div className="no-results">No tweets found</div>
            )
          ) : (
            users.length > 0 ? (
              users.map(user => (
                <UserCard key={user._id} user={user} />
              ))
            ) : (
              searchTerm && <div className="no-results">No users found</div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Search; 