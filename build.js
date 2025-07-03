#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting Twitter Clone build process...');

try {
  // Install server dependencies
  console.log('📦 Installing server dependencies...');
  process.chdir(path.join(__dirname, 'server'));
  execSync('npm ci', { stdio: 'inherit' });
  
  // Install client dependencies
  console.log('📦 Installing client dependencies...');
  process.chdir(path.join(__dirname, 'client'));
  execSync('npm ci', { stdio: 'inherit' });
  
  // Build client
  console.log('🔨 Building client...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 