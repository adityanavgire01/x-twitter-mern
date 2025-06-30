const express = require('express');
const router = express.Router();
const Tweet = require('../models/Tweet');
const auth = require('../middleware/auth');
const upload = require('../utils/mediaUpload');

// Create a tweet
router.post('/', auth, upload.array('media', 4), async (req, res) => {
  try {
    const mediaFiles = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    
    const newTweet = new Tweet({
      content: req.body.content,
      author: req.user._id,
      media: mediaFiles
    });

    const tweet = await newTweet.save();
    await tweet.populate('author', 'username displayName profileImage');
    
    res.status(201).json(tweet);
  } catch (error) {
    console.error('Error creating tweet:', error);
    res.status(500).json({ message: 'Error creating tweet' });
  }
});

// Get feed tweets (all tweets from all users)
router.get('/feed', auth, async (req, res) => {
  try {
    const tweets = await Tweet.find({
      parentTweet: null // Only get original tweets, not replies
    })
    .sort({ createdAt: -1 }) // Sort by newest first
    .populate('author', 'username displayName profileImage')
    .limit(50); // Show more tweets since it's a global feed

    res.json(tweets);
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({ message: 'Error fetching feed' });
  }
});

// Get user's tweets
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const tweets = await Tweet.find({
      author: req.params.userId,
      parentTweet: null
    })
    .sort({ createdAt: -1 })
    .populate('author', 'username displayName profileImage');

    res.json(tweets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user tweets' });
  }
});

// Like/Unlike a tweet
router.post('/:tweetId/like', auth, async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.tweetId);
    
    if (!tweet) {
      return res.status(404).json({ message: 'Tweet not found' });
    }

    const likeIndex = tweet.likes.indexOf(req.user._id);
    
    if (likeIndex === -1) {
      // Like the tweet
      tweet.likes.push(req.user._id);
    } else {
      // Unlike the tweet
      tweet.likes.splice(likeIndex, 1);
    }

    await tweet.save();
    res.json(tweet);
  } catch (error) {
    res.status(500).json({ message: 'Error updating like' });
  }
});

// Retweet/Unretweet a tweet
router.post('/:tweetId/retweet', auth, async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.tweetId);
    
    if (!tweet) {
      return res.status(404).json({ message: 'Tweet not found' });
    }

    const retweetIndex = tweet.retweets.indexOf(req.user._id);
    
    if (retweetIndex === -1) {
      // Retweet
      tweet.retweets.push(req.user._id);
    } else {
      // Unretweet
      tweet.retweets.splice(retweetIndex, 1);
    }

    await tweet.save();
    res.json(tweet);
  } catch (error) {
    res.status(500).json({ message: 'Error updating retweet' });
  }
});

// Reply to a tweet
router.post('/:tweetId/reply', auth, async (req, res) => {
  try {
    const parentTweet = await Tweet.findById(req.params.tweetId);
    
    if (!parentTweet) {
      return res.status(404).json({ message: 'Parent tweet not found' });
    }

    const reply = new Tweet({
      content: req.body.content,
      author: req.user._id,
      parentTweet: req.params.tweetId,
      media: req.body.media || []
    });

    const savedReply = await reply.save();
    parentTweet.replies.push(savedReply._id);
    await parentTweet.save();

    await savedReply.populate('author', 'username displayName profileImage');
    
    res.status(201).json(savedReply);
  } catch (error) {
    res.status(500).json({ message: 'Error creating reply' });
  }
});

// Get replies to a tweet
router.get('/:tweetId/replies', auth, async (req, res) => {
  try {
    const replies = await Tweet.find({
      parentTweet: req.params.tweetId
    })
    .sort({ createdAt: -1 })
    .populate('author', 'username displayName profileImage');

    res.json(replies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching replies' });
  }
});

// Get a single tweet by ID
router.get('/:tweetId', auth, async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.tweetId)
      .populate('author', 'username displayName profileImage');
    
    if (!tweet) {
      return res.status(404).json({ message: 'Tweet not found' });
    }
    
    res.json(tweet);
  } catch (error) {
    console.error('Error fetching tweet:', error);
    res.status(500).json({ message: 'Error fetching tweet' });
  }
});

module.exports = router; 