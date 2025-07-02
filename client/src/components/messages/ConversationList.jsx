import { DEFAULT_AVATAR } from '../../constants/defaults.jsx';
import './Messages.css';

const ConversationList = ({ conversations, loading, error, onConversationSelect }) => {
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return diffInMinutes < 1 ? 'now' : `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const truncateMessage = (message, maxLength = 50) => {
    if (!message) return '';
    return message.length > maxLength ? `${message.substring(0, maxLength)}...` : message;
  };

  if (loading) {
    return (
      <div className="conversation-list">
        <div className="conversation-loading">Loading conversations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="conversation-list">
        <div className="conversation-error">{error}</div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="conversation-list">
        <div className="no-conversations">
          <i className="far fa-envelope"></i>
          <h3>No messages yet</h3>
          <p>Start a conversation with someone you follow</p>
          <p>Click the <i className="fas fa-plus"></i> button above to begin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="conversation-list">
      {conversations.map((conversation) => (
        <div
          key={conversation.partner._id}
          className={`conversation-item ${conversation.unreadCount > 0 ? 'unread' : ''}`}
          onClick={() => onConversationSelect(conversation)}
        >
          <div className="conversation-avatar">
            <img
              src={conversation.partner.profileImage || DEFAULT_AVATAR}
              alt={conversation.partner.username}
            />
          </div>
          
          <div className="conversation-content">
            <div className="conversation-header">
              <div className="conversation-names">
                <span className="conversation-name">
                  {conversation.partner.displayName || conversation.partner.name}
                </span>
                <span className="conversation-username">
                  @{conversation.partner.username}
                </span>
              </div>
              <span className="conversation-time">
                {formatTime(conversation.lastMessage.createdAt)}
              </span>
            </div>
            
            <div className="conversation-preview">
              <span className="last-message">
                {truncateMessage(conversation.lastMessage.content)}
              </span>
              {conversation.unreadCount > 0 && (
                <span className="unread-badge">{conversation.unreadCount}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConversationList; 