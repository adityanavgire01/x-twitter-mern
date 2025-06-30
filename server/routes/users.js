const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const Tweet = require('../models/Tweet');
const upload = require('../utils/mediaUpload');

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

// Unfollow a user (This route is redundant with the follow/unfollow toggle above)
router.post('/:userId/unfollow', auth, async (req, res) => {
    try {
        if (req.params.userId === req.user._id.toString()) {
            return res.status(400).json({ message: "You cannot unfollow yourself" });
        }

        const userToUnfollow = await User.findById(req.params.userId);
        const currentUser = await User.findById(req.user._id);

        if (!userToUnfollow || !currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!currentUser.following.includes(userToUnfollow._id)) {
            return res.status(400).json({ message: "You are not following this user" });
        }

        // Remove from following and followers
        currentUser.following = currentUser.following.filter(id => id.toString() !== userToUnfollow._id.toString());
        userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== currentUser._id.toString());

        await currentUser.save();
        await userToUnfollow.save();

        res.json({ message: "Successfully unfollowed user" });
    } catch (error) {
        res.status(500).json({ message: "Error unfollowing user" });
    }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { displayName, bio } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (displayName) user.displayName = displayName;
        if (bio) user.bio = bio;

        await user.save();
        res.json(user);
    } catch (error) {
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