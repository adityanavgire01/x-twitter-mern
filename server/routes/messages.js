const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all conversations for the current user
router.get('/conversations', auth, async (req, res) => {
  try {
    // Get all messages where user is either sender or recipient
    const messages = await Message.find({
      $or: [
        { sender: req.user._id },
        { recipient: req.user._id }
      ]
    })
    .populate('sender', 'username displayName profileImage')
    .populate('recipient', 'username displayName profileImage')
    .sort({ createdAt: -1 });

    // Group messages by conversation partner
    const conversationsMap = new Map();
    
    messages.forEach(message => {
      const partnerId = message.sender._id.toString() === req.user._id.toString() 
        ? message.recipient._id.toString()
        : message.sender._id.toString();
      
      if (!conversationsMap.has(partnerId)) {
        const partner = message.sender._id.toString() === req.user._id.toString() 
          ? message.recipient 
          : message.sender;
        
        conversationsMap.set(partnerId, {
          partner,
          lastMessage: message,
          unreadCount: 0
        });
      }
      
      // Count unread messages (messages sent to current user that are unread)
      if (message.recipient._id.toString() === req.user._id.toString() && !message.read) {
        conversationsMap.get(partnerId).unreadCount++;
      }
    });

    const conversations = Array.from(conversationsMap.values());
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Error fetching conversations' });
  }
});

// Get messages between current user and another user
router.get('/conversation/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if users exist
    const currentUser = await User.findById(req.user._id);
    const otherUser = await User.findById(userId);
    
    if (!currentUser || !otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // No restriction for viewing conversations - users can receive messages from anyone
    // Restriction only applies to sending messages
    
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: userId },
        { sender: userId, recipient: req.user._id }
      ]
    })
    .populate('sender', 'username displayName profileImage')
    .populate('recipient', 'username displayName profileImage')
    .sort({ createdAt: 1 }); // Oldest first for conversation view
    
    // Mark messages as read if they were sent to current user
    await Message.updateMany(
      { sender: userId, recipient: req.user._id, read: false },
      { read: true }
    );
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ message: 'Error fetching conversation' });
  }
});

// Send a message
router.post('/send', auth, async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }
    
    // Check if the users are following each other
    const currentUser = await User.findById(req.user._id);
    const recipient = await User.findById(recipientId);
    
    if (!currentUser || !recipient) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if current user is following the recipient
    if (!currentUser.following.includes(recipientId)) {
      return res.status(403).json({ message: 'You can only message users you follow' });
    }
    
    const message = new Message({
      sender: req.user._id,
      recipient: recipientId,
      content: content.trim()
    });
    
    await message.save();
    
    // Populate sender and recipient data
    await message.populate('sender', 'username displayName profileImage');
    await message.populate('recipient', 'username displayName profileImage');
    
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

// Mark messages as read
router.put('/read/:conversationUserId', auth, async (req, res) => {
  try {
    const { conversationUserId } = req.params;
    
    await Message.updateMany(
      { sender: conversationUserId, recipient: req.user._id, read: false },
      { read: true }
    );
    
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Error marking messages as read' });
  }
});

// Get users that current user is following (for starting new conversations)
router.get('/followees', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('following', 'username displayName profileImage bio');
    
    res.json(user.following);
  } catch (error) {
    console.error('Error fetching followees:', error);
    res.status(500).json({ message: 'Error fetching followees' });
  }
});

module.exports = router; 