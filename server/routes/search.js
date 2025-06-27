const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Tweet = require('../models/Tweet');
const auth = require('../middleware/auth');

// Search users
router.get('/users', auth, async (req, res) => {
    try {
        const searchQuery = req.query.q;
        if (!searchQuery) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const users = await User.find({
            $or: [
                { username: { $regex: searchQuery, $options: 'i' } },
                { displayName: { $regex: searchQuery, $options: 'i' } }
            ]
        })
        .select('username displayName bio profileImage followers following')
        .limit(20);

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error searching users" });
    }
});

// Search tweets
router.get('/tweets', auth, async (req, res) => {
    try {
        const searchQuery = req.query.q;
        if (!searchQuery) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const tweets = await Tweet.find({
            content: { $regex: searchQuery, $options: 'i' }
        })
        .populate('author', 'username displayName profileImage')
        .sort({ createdAt: -1 })
        .limit(20);

        res.json(tweets);
    } catch (error) {
        res.status(500).json({ message: "Error searching tweets" });
    }
});

// Combined search (both users and tweets)
router.get('/all', auth, async (req, res) => {
    try {
        const searchQuery = req.query.q;
        if (!searchQuery) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const [users, tweets] = await Promise.all([
            User.find({
                $or: [
                    { username: { $regex: searchQuery, $options: 'i' } },
                    { displayName: { $regex: searchQuery, $options: 'i' } }
                ]
            })
            .select('username displayName bio profileImage')
            .limit(10),

            Tweet.find({
                content: { $regex: searchQuery, $options: 'i' }
            })
            .populate('author', 'username displayName profileImage')
            .sort({ createdAt: -1 })
            .limit(10)
        ]);

        res.json({
            users,
            tweets
        });
    } catch (error) {
        res.status(500).json({ message: "Error performing search" });
    }
});

module.exports = router; 