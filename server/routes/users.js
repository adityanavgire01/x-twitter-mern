const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const Tweet = require('../models/Tweet');
const upload = require('../utils/mediaUpload');

// Get suggested users (random registered users excluding followed ones)
// This must come before /:identifier route to avoid conflicts
router.get('/suggested', auth, async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const currentUser = await User.findById(req.user._id);
    
    // Get all users that current user is not following (excluding themselves)
    const allUnfollowedUsers = await User.find({
      _id: { 
        $nin: [...(currentUser.following || []), currentUser._id] 
      }
    })
    .select('username displayName profileImage bio followers')
    .lean(); // Use lean() for better performance

    // If no unfollowed users, return empty result
    if (allUnfollowedUsers.length === 0) {
      return res.json({
        users: [],
        hasMore: false,
        total: 0
      });
    }

    // Randomly shuffle the array and take the requested limit
    const shuffled = allUnfollowedUsers.sort(() => 0.5 - Math.random());
    const suggestedUsers = shuffled.slice(0, parseInt(limit));

    res.json({
      users: suggestedUsers,
      hasMore: allUnfollowedUsers.length > parseInt(limit),
      total: allUnfollowedUsers.length
    });
  } catch (error) {
    console.error('Error fetching suggested users:', error);
    res.status(500).json({ message: 'Error fetching suggested users' });
  }
});

// Get user profile by username or ID
router.get('/:identifier', auth, async (req, res) => {
    try {
        const identifier = req.params.identifier;
        let user;

        // Check if identifier is a valid MongoDB ObjectId
        if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
            user = await User.findById(identifier);
        } else {
            // If not an ObjectId, treat as username
            user = await User.findOne({ username: identifier });
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Remove password and populate followers/following
        user = await User.findById(user._id)
            .select('-password')
            .populate('followers', 'username displayName profileImage')
            .populate('following', 'username displayName profileImage');

        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: "Error fetching user profile" });
    }
});

// Get user's tweets
router.get('/:identifier/tweets', auth, async (req, res) => {
    try {
        const identifier = req.params.identifier;
        let user;

        // Check if identifier is a valid MongoDB ObjectId
        if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
            user = await User.findById(identifier);
        } else {
            // If not an ObjectId, treat as username
            user = await User.findOne({ username: identifier });
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const tweets = await Tweet.find({
            author: user._id,
            parentTweet: null
        })
        .sort({ createdAt: -1 })
        .populate('author', 'username displayName profileImage');

        res.json(tweets);
    } catch (error) {
        console.error('Error fetching user tweets:', error);
        res.status(500).json({ message: "Error fetching user tweets" });
    }
});

// Follow/Unfollow a user
router.post('/:identifier/follow', auth, async (req, res) => {
    try {
        const identifier = req.params.identifier;
        let userToFollow;

        // Check if identifier is a valid MongoDB ObjectId
        if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
            userToFollow = await User.findById(identifier);
        } else {
            // If not an ObjectId, treat as username
            userToFollow = await User.findOne({ username: identifier });
        }

        if (!userToFollow) {
            return res.status(404).json({ message: "User not found" });
        }

        // Can't follow yourself
        if (userToFollow._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const currentUser = await User.findById(req.user._id);

        // Check if already following
        const isFollowing = currentUser.following.includes(userToFollow._id);

        if (isFollowing) {
            // Unfollow
            currentUser.following = currentUser.following.filter(
                id => id.toString() !== userToFollow._id.toString()
            );
            userToFollow.followers = userToFollow.followers.filter(
                id => id.toString() !== currentUser._id.toString()
            );
        } else {
            // Follow
            currentUser.following.push(userToFollow._id);
            userToFollow.followers.push(currentUser._id);
        }

        await Promise.all([
            currentUser.save(),
            userToFollow.save()
        ]);

        res.json({
            following: !isFollowing,
            followers: userToFollow.followers
        });
    } catch (error) {
        console.error('Error following/unfollowing user:', error);
        res.status(500).json({ message: "Error following/unfollowing user" });
    }
});



// Update user profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { name, displayName, bio, location, website } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Handle both 'name' and 'displayName' field names for compatibility
        if (name) user.displayName = name;
        if (displayName) user.displayName = displayName;
        if (bio !== undefined) user.bio = bio;
        if (location !== undefined) user.location = location;
        if (website !== undefined) user.website = website;

        await user.save();
        
        // Return user without password
        const updatedUser = await User.findById(user._id).select('-password');
        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: "Error updating profile" });
    }
});

// Upload profile picture - SAFE VERSION with comprehensive error handling
router.post('/profile-image', auth, async (req, res) => {
  let uploadedFilePath = null;
  let originalProfileImage = null;
  
  try {
    // Step 1: Get user and store original profile image for rollback
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    originalProfileImage = user.profileImage;

    // Step 2: Handle file upload with custom error handling
    await new Promise((resolve, reject) => {
      upload.single('profileImage')(req, res, (err) => {
        if (err) {
          console.error('Upload middleware error:', err);
          if (err.code === 'LIMIT_FILE_SIZE') {
            return reject(new Error('File too large. Maximum size is 5MB.'));
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return reject(new Error('Too many files. Please upload one image.'));
          }
          if (err.message.includes('Invalid file type')) {
            return reject(new Error('Invalid file type. Please upload JPEG, PNG, GIF, or WebP images only.'));
          }
          return reject(new Error(`Upload failed: ${err.message}`));
        }
        resolve();
      });
    });

    // Step 3: Validate uploaded file
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded. Please select an image.' });
    }

    uploadedFilePath = req.file.path;
    console.log('File uploaded successfully:', req.file.filename);

    // Step 4: Additional file validation
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      throw new Error('Invalid file type detected after upload.');
    }

    // Step 5: Create image URL (handle both production and development)
    let imageUrl;
    if (process.env.NODE_ENV === 'production') {
      const host = req.get('host');
      imageUrl = `https://${host}/uploads/${req.file.filename}`;
    } else {
      const port = process.env.PORT || 5000;
      imageUrl = `http://localhost:${port}/uploads/${req.file.filename}`;
    }

    // Step 6: Update user profile with transaction-like behavior
    const previousImage = user.profileImage;
    user.profileImage = imageUrl;
    
    // Step 7: Save user and validate the save was successful
    const savedUser = await user.save();
    if (!savedUser) {
      throw new Error('Failed to save user profile');
    }

    console.log('Profile image updated successfully:', {
      userId: user._id,
      previousImage,
      newImage: imageUrl,
      filename: req.file.filename
    });

    // Step 8: Return success response
    res.json({ 
      success: true,
      profileImage: savedUser.profileImage,
      message: 'Profile image uploaded and updated successfully!',
      filename: req.file.filename
    });

  } catch (error) {
    console.error('Profile image upload error:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
      uploadedFile: uploadedFilePath
    });

    // Step 9: Cleanup on error - remove uploaded file if it exists
    if (uploadedFilePath && require('fs').existsSync(uploadedFilePath)) {
      try {
        require('fs').unlinkSync(uploadedFilePath);
        console.log('Cleaned up uploaded file after error:', uploadedFilePath);
      } catch (cleanupError) {
        console.error('Failed to cleanup uploaded file:', cleanupError.message);
      }
    }

    // Step 10: Rollback user profile image if it was modified
    if (originalProfileImage !== null && req.user?._id) {
      try {
        await User.findByIdAndUpdate(req.user._id, { profileImage: originalProfileImage });
        console.log('Rolled back profile image to original value');
      } catch (rollbackError) {
        console.error('Failed to rollback profile image:', rollbackError.message);
      }
    }

    // Step 11: Send appropriate error response
    const errorMessage = error.message || 'Unknown error occurred during upload';
    const statusCode = error.message.includes('File too large') ? 413 :
                      error.message.includes('Invalid file type') ? 415 :
                      error.message.includes('No file uploaded') ? 400 : 500;

    res.status(statusCode).json({ 
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Test endpoint for profile upload functionality - DEVELOPMENT ONLY
router.get('/test-upload-health', auth, async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Check if uploads directory exists and is writable
    const uploadsDir = path.join(__dirname, '../uploads');
    const uploadsExists = fs.existsSync(uploadsDir);
    
    let uploadsWritable = false;
    if (uploadsExists) {
      try {
        const testFile = path.join(uploadsDir, 'test-write.tmp');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        uploadsWritable = true;
      } catch (writeError) {
        console.error('Uploads directory not writable:', writeError.message);
      }
    }

    // Check user exists and can be updated
    const user = await User.findById(req.user._id);
    const userExists = !!user;

    res.json({
      success: true,
      uploadHealthCheck: {
        uploadsDirectoryExists: uploadsExists,
        uploadsDirectoryWritable: uploadsWritable,
        userExists: userExists,
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      },
      message: 'Upload system health check completed',
      recommendations: uploadsExists && uploadsWritable && userExists 
        ? ['All systems ready for profile upload testing']
        : [
            !uploadsExists ? 'Create uploads directory' : null,
            !uploadsWritable ? 'Fix uploads directory permissions' : null,
            !userExists ? 'User authentication issue' : null
          ].filter(Boolean)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Upload health check failed',
      error: error.message
    });
  }
});

module.exports = router; 