const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const passport = require('passport');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const tweetRoutes = require('./routes/tweets');
const userRoutes = require('./routes/users');
const searchRoutes = require('./routes/search');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());

// Configure static file serving - this should come before routes
const uploadsPath = path.join(__dirname, 'uploads');
console.log('Uploads directory path:', uploadsPath); // Debug log
app.use('/uploads', express.static(uploadsPath));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tweets', tweetRoutes);
app.use('/api/users', userRoutes);
app.use('/api/search', searchRoutes);

// Debug endpoint to check if server is serving files
app.get('/test-uploads', (req, res) => {
  res.json({
    message: 'Upload path configuration',
    uploadsPath,
    exists: require('fs').existsSync(uploadsPath),
    files: require('fs').readdirSync(uploadsPath)
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Static files will be served from: ${uploadsPath}`);
}); 