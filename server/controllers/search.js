const Tweet = require('../models/Tweet');
const User = require('../models/User');

// Search tweets
exports.searchTweets = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // First, find users matching the query
    const matchingUsers = await User.find({
      username: { $regex: q, $options: 'i' }
    }).select('_id');

    const userIds = matchingUsers.map(user => user._id);

    // Then search tweets by content or author
    const tweets = await Tweet.find({
      $or: [
        { content: { $regex: q, $options: 'i' } },
        { author: { $in: userIds } }
      ]
    })
    .populate('author', 'name username avatar')
    .sort({ createdAt: -1 })
    .limit(20);

    res.json(tweets);
  } catch (error) {
    console.error('Search tweets error:', error);
    res.status(500).json({ message: 'Error searching tweets' });
  }
};

// Search users
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } }
      ]
    }, 'name username avatar bio followers')
    .limit(20);

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Error searching users' });
  }
}; 