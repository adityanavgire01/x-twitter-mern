import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/auth';
import axios from '../../config/axios';
import { DEFAULT_AVATAR } from '../../constants/defaults.jsx';
import './Messages.css';

const ChatWindow = ({ conversation, onBack, onMessageSent }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!conversation.isNew) {
      fetchMessages();
    } else {
      setLoading(false);
      setMessages([]);
    }
  }, [conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`/messages/conversation/${conversation.partner._id}`);
      setMessages(response.data);
      setError(null);
    } catch (error) {
      setError('Failed to load messages');
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await axios.post('/messages/send', {
        recipientId: conversation.partner._id,
        content: newMessage.trim()
      });

      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      onMessageSent(response.data);
      setError(null);
    } catch (error) {
      if (error.response?.status === 403) {
        setError('You can only send messages to users you follow. Follow this user first to send messages.');
      } else {
        setError('Failed to send message');
      }
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="chat-window">
        <div className="chat-loading">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <button className="back-button" onClick={onBack}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <div className="chat-partner-info">
          <img
            src={conversation.partner.profileImage || DEFAULT_AVATAR}
            alt={conversation.partner.username}
            className="chat-partner-avatar"
          />
          <div className="chat-partner-details">
            <h3>{conversation.partner.displayName || conversation.partner.name}</h3>
            <p>@{conversation.partner.username}</p>
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={`message ${
                message.sender._id === user._id ? 'message-sent' : 'message-received'
              }`}
            >
              <div className="message-content">
                <p>{message.content}</p>
                <span className="message-time">
                  {formatMessageTime(message.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="chat-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSendMessage} className="chat-input-form">
        <div className="chat-input-container">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            maxLength={1000}
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="send-button"
          >
            {sending ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-paper-plane"></i>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow; 