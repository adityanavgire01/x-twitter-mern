#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Twitter Clone build process...');

function installDependencies(dir, name) {
  const lockFile = path.join(dir, 'package-lock.json');
  const command = fs.existsSync(lockFile) ? 'npm ci' : 'npm install';
  console.log(`📦 Installing ${name} dependencies with ${command}...`);
  execSync(command, { stdio: 'inherit' });
}

try {
  // Install server dependencies
  const serverDir = path.join(__dirname, 'server');
  process.chdir(serverDir);
  installDependencies(serverDir, 'server');
  
  // Install client dependencies
  const clientDir = path.join(__dirname, 'client');
  process.chdir(clientDir);
  installDependencies(clientDir, 'client');
  
  // Build client
  console.log('🔨 Building client...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 