const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Follow a user
router.post('/:userId/follow', auth, async (req, res) => {
    try {
        if (req.params.userId === req.user.id) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const userToFollow = await User.findById(req.params.userId);
        const currentUser = await User.findById(req.user.id);

        if (!userToFollow || !currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (currentUser.following.includes(userToFollow.id)) {
            return res.status(400).json({ message: "You are already following this user" });
        }

        // Add to following and followers
        currentUser.following.push(userToFollow.id);
        userToFollow.followers.push(currentUser.id);

        await currentUser.save();
        await userToFollow.save();

        res.json({ message: "Successfully followed user" });
    } catch (error) {
        res.status(500).json({ message: "Error following user" });
    }
});

// Unfollow a user
router.post('/:userId/unfollow', auth, async (req, res) => {
    try {
        if (req.params.userId === req.user.id) {
            return res.status(400).json({ message: "You cannot unfollow yourself" });
        }

        const userToUnfollow = await User.findById(req.params.userId);
        const currentUser = await User.findById(req.user.id);

        if (!userToUnfollow || !currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!currentUser.following.includes(userToUnfollow.id)) {
            return res.status(400).json({ message: "You are not following this user" });
        }

        // Remove from following and followers
        currentUser.following = currentUser.following.filter(id => id.toString() !== userToUnfollow.id);
        userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== currentUser.id);

        await currentUser.save();
        await userToUnfollow.save();

        res.json({ message: "Successfully unfollowed user" });
    } catch (error) {
        res.status(500).json({ message: "Error unfollowing user" });
    }
});

// Get user profile
router.get('/:userId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .select('-password')
            .populate('followers', 'username displayName profileImage')
            .populate('following', 'username displayName profileImage');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user profile" });
    }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { displayName, bio } = req.body;
        const user = await User.findById(req.user.id);

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

module.exports = router; 