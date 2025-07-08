import { useState, useEffect } from 'react';
import axios from '../../config/axios';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import './Messages.css';

const MessagesPanel = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showNewMessageView, setShowNewMessageView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await axios.get('/messages/conversations');
      setConversations(response.data);
      setError(null);
    } catch (error) {
      setError('Failed to load conversations');
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    setShowNewMessageView(false);
  };

  const handleNewMessage = async (recipientId) => {
    // Create a new conversation object or select existing one
    const existingConversation = conversations.find(
      conv => conv.partner._id === recipientId
    );
    
    if (existingConversation) {
      setSelectedConversation(existingConversation);
    } else {
      // Fetch user details for new conversation
      try {
        const response = await axios.get(`/users/${recipientId}`);
        setSelectedConversation({ 
          partner: response.data,
          isNew: true 
        });
      } catch (error) {
        console.error('Error fetching user details:', error);
        setError('Failed to load user details');
      }
    }
    setShowNewMessageView(false);
  };

  const handleMessageSent = (message) => {
    // Update conversations list
    fetchConversations();
    
    // If this is a new conversation, update the selected conversation
    if (selectedConversation?.isNew) {
      setSelectedConversation({
        partner: message.recipient,
        lastMessage: message
      });
    }
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
    setShowNewMessageView(false);
  };

  const handleBackFromNewMessage = () => {
    setShowNewMessageView(false);
  };

  const renderContent = () => {
    if (selectedConversation) {
      return (
        <ChatWindow
          conversation={selectedConversation}
          onBack={handleBackToList}
          onMessageSent={handleMessageSent}
        />
      );
    }
    
    if (showNewMessageView) {
      return (
        <div className="new-message-inline">
          <div className="new-message-header">
            <button 
              className="back-button"
              onClick={handleBackFromNewMessage}
            >
              <i className="fas fa-arrow-left"></i>
            </button>
            <h3>New Message</h3>
          </div>
          <NewMessageInlineContent 
            onSelectRecipient={handleNewMessage}
          />
        </div>
      );
    }
    
    return (
      <ConversationList
        conversations={conversations}
        loading={loading}
        error={error}
        onConversationSelect={handleConversationSelect}
      />
    );
  };

  return (
    <div className="messages-panel">
      <div className="messages-header">
        <h2>Messages</h2>
        <button 
          className="new-message-button"
          onClick={() => setShowNewMessageView(true)}
          title="New message"
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>

      {renderContent()}
    </div>
  );
};

// Inline component for new message functionality
const NewMessageInlineContent = ({ onSelectRecipient }) => {
  const [followees, setFollowees] = useState([]);
  const [filteredFollowees, setFilteredFollowees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFollowees();
  }, []);

  useEffect(() => {
    const filtered = followees.filter(user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFollowees(filtered);
  }, [followees, searchTerm]);

  const fetchFollowees = async () => {
    try {
      const response = await axios.get('/messages/followees');
      setFollowees(response.data);
      setFilteredFollowees(response.data);
      setError(null);
    } catch (error) {
      setError('Failed to load people you follow');
      console.error('Error fetching followees:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-state">Loading people you follow...</div>;
  }

  if (error) {
    return <div className="error-state">{error}</div>;
  }

  return (
    <div className="new-message-content">
      <div className="search-section">
        <input
          type="text"
          placeholder="Search people you follow"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      
      <div className="followees-list">
        {filteredFollowees.length === 0 ? (
          <div className="no-followees">
            {searchTerm ? 'No matching people found' : 'You are not following anyone yet'}
          </div>
        ) : (
          filteredFollowees.map(user => (
            <div
              key={user._id}
              className="followee-item"
              onClick={() => onSelectRecipient(user._id)}
            >
              <div className="followee-avatar">
                {user.profileImage ? (
                  <img src={user.profileImage} alt={user.username} />
                ) : (
                  <div className="default-avatar">
                    {user.username[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="followee-info">
                <div className="followee-name">{user.displayName || user.username}</div>
                <div className="followee-username">@{user.username}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MessagesPanel; 