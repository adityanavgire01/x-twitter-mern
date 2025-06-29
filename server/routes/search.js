const express = require('express');
const router = express.Router();
const { searchTweets, searchUsers } = require('../controllers/search');
const auth = require('../middleware/auth');

// Search routes
router.get('/tweets', auth, searchTweets);
router.get('/users', auth, searchUsers);

module.exports = router; 