#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🚀 Setting up environment files for deployment...\n');

// Generate a secure JWT secret
const jwtSecret = crypto.randomBytes(32).toString('hex');

// Server environment template
const serverEnv = `# Database Configuration
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/twitter-clone?retryWrites=true&w=majority

# Authentication (Generated secure key)
JWT_SECRET=${jwtSecret}

# Server Configuration
NODE_ENV=production
PORT=5000

# Client Configuration (update with your actual frontend URL)
CLIENT_URL=https://your-frontend-domain.com

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
`;

// Client environment template
const clientEnv = `# API Configuration (update with your actual backend URL)
VITE_API_URL=https://your-backend-domain.com/api
VITE_BASE_URL=https://your-backend-domain.com

# Development URLs (for local development)
# VITE_API_URL=http://localhost:5000/api
# VITE_BASE_URL=http://localhost:5000
`;

try {
  // Create server .env file
  const serverEnvPath = path.join(__dirname, '../server/.env');
  if (!fs.existsSync(serverEnvPath)) {
    fs.writeFileSync(serverEnvPath, serverEnv);
    console.log('✅ Created server/.env file');
  } else {
    console.log('⚠️  server/.env already exists, skipping...');
  }

  // Create client .env file
  const clientEnvPath = path.join(__dirname, '../client/.env');
  if (!fs.existsSync(clientEnvPath)) {
    fs.writeFileSync(clientEnvPath, clientEnv);
    console.log('✅ Created client/.env file');
  } else {
    console.log('⚠️  client/.env already exists, skipping...');
  }

  console.log('\n📝 Next steps:');
  console.log('1. Update MONGODB_URI in server/.env with your MongoDB Atlas connection string');
  console.log('2. Update CLIENT_URL in server/.env with your frontend domain');
  console.log('3. Update VITE_API_URL and VITE_BASE_URL in client/.env with your backend domain');
  console.log('4. Follow the DEPLOYMENT.md guide for platform-specific instructions');
  console.log('\n🔐 A secure JWT secret has been generated for you!');

} catch (error) {
  console.error('❌ Error setting up environment files:', error.message);
  process.exit(1);
} 