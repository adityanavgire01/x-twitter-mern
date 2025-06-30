import { useState, useRef } from 'react';
import { useAuth } from '../../context/auth';
import { DEFAULT_AVATAR } from '../../constants/defaults.jsx';
import './Tweets.css';

const CreateTweet = ({ onTweetCreate }) => {
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const fileInputRef = useRef(null);
  const { user } = useAuth();
  const maxLength = 280;

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 4) {
      alert('You can only upload up to 4 images');
      return;
    }

    setSelectedFiles(files);
    
    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleRemoveFile = (index) => {
    const newFiles = [...selectedFiles];
    const newUrls = [...previewUrls];
    
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(newUrls[index]);
    
    newFiles.splice(index, 1);
    newUrls.splice(index, 1);
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newUrls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && selectedFiles.length === 0) return;

    const formData = new FormData();
    formData.append('content', content);
    selectedFiles.forEach(file => {
      formData.append('media', file);
    });

    await onTweetCreate(formData);
    setContent('');
    setSelectedFiles([]);
    setPreviewUrls(urls => {
      urls.forEach(url => URL.revokeObjectURL(url));
      return [];
    });
  };

  return (
    <div className="create-tweet">
      <div className="create-tweet-header">
        <img 
          src={user?.profileImage || DEFAULT_AVATAR} 
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
          
          {previewUrls.length > 0 && (
            <div className="media-preview">
              {previewUrls.map((url, index) => (
                <div key={index} className="media-preview-item">
                  <img src={url} alt={`Preview ${index + 1}`} />
                  <button
                    type="button"
                    className="remove-media-button"
                    onClick={() => handleRemoveFile(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="tweet-form-actions">
            <div className="tweet-form-buttons">
              <input
                type="file"
                accept="image/*"
                multiple
                ref={fileInputRef}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="media-button"
                onClick={() => fileInputRef.current.click()}
                disabled={selectedFiles.length >= 4}
              >
                <i className="far fa-image"></i>
              </button>
              <span className="character-count">
                {maxLength - content.length}
              </span>
            </div>
            <button 
              type="submit" 
              className="tweet-button"
              disabled={!content.trim() && selectedFiles.length === 0}
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