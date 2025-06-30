import { useRef, useState } from 'react';
import { useAuth } from '../../context/auth';
import axios from '../../config/axios';
import { DEFAULT_PROFILE_IMAGE } from '../../constants/defaults.jsx';
import './Profile.css';

const ProfilePicture = ({ profile, onUpdate }) => {
  const fileInputRef = useRef(null);
  const { user, updateUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  

  
  // Multiple ways to check if it's the user's own profile
  const isOwnProfile = user?._id === profile._id || user?.username === profile.username;

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await axios.post('/users/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Update local state and context
      const newProfileImage = response.data.profileImage;
      onUpdate(newProfileImage);
      updateUser({ profileImage: newProfileImage });
      
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleProfileImageClick = () => {
    if (isOwnProfile) {
      // Show upload options
      fileInputRef.current?.click();
    } else {
      // Show image in full size
      setShowImageModal(true);
    }
  };

  const profileImageSrc = profile.profileImage || DEFAULT_PROFILE_IMAGE;

  return (
    <>
      <div 
        className={`profile-picture-container ${isOwnProfile ? 'own-profile' : ''}`}
        onClick={handleProfileImageClick}
        style={{ cursor: isOwnProfile ? 'pointer' : 'zoom-in' }}
      >
        <img
          src={profileImageSrc}
          alt={profile.displayName || profile.name}
          className="avatar-image"
        />
        

        
        {isOwnProfile && (
          <div className={`profile-picture-overlay ${isUploading ? 'uploading' : ''}`}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              style={{ display: 'none' }}
            />
            {isUploading ? (
              <div className="upload-spinner">
                <i className="fas fa-spinner fa-spin"></i>
                <span>Uploading...</span>
              </div>
            ) : (
              <div className="change-photo-button">
                <i className="fas fa-camera"></i>
                <span>Change Photo</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image preview modal */}
      {showImageModal && (
        <div className="image-modal" onClick={() => setShowImageModal(false)}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="image-modal-close"
              onClick={() => setShowImageModal(false)}
            >
              <i className="fas fa-times"></i>
            </button>
            <img
              src={profileImageSrc}
              alt={profile.displayName || profile.name}
              className="image-modal-img"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePicture; 