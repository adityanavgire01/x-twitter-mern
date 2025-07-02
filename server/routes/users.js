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

// Upload profile picture
router.post('/profile-image', auth, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user's profile image
    user.profileImage = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({ profileImage: user.profileImage });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ message: 'Error uploading profile image' });
  }
});

module.exports = router; 