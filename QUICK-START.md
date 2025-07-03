# 🚀 Quick Start - Deploy Your Twitter Clone

## 5-Minute Setup for Production

### Step 1: Set Up Environment Variables
```bash
npm run setup-env
```
This generates secure environment files with a random JWT secret.

### Step 2: Configure MongoDB Atlas
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/) and create a free account
2. Create a new cluster (free tier)
3. Get your connection string from "Connect" → "Connect your application"
4. Update `server/.env` with your MongoDB URI

### Step 3: Choose Your Deployment Platform

#### Option A: Heroku (Easiest - Full Stack)
```bash
# Install Heroku CLI, then:
heroku login
heroku create your-app-name
heroku config:set MONGODB_URI="your_atlas_connection_string"
heroku config:set JWT_SECRET="$(grep JWT_SECRET server/.env | cut -d '=' -f2)"
heroku config:set NODE_ENV=production
heroku config:set CLIENT_URL=https://your-app-name.herokuapp.com
git push heroku main
```

#### Option B: Railway (Recommended - Free Tier)
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repo
3. Set these environment variables in Railway dashboard:
   - `MONGODB_URI`: Your Atlas connection string
   - `JWT_SECRET`: Copy from your `server/.env` file
   - `NODE_ENV`: production
   - `CLIENT_URL`: Your Railway app URL

#### Option C: Render (Free Alternative)
1. Go to [render.com](https://render.com)
2. Create new Web Service from your repo
3. Set environment variables same as Railway

### Step 4: Update Frontend URLs
After backend is deployed, update `client/.env`:
```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_BASE_URL=https://your-backend-domain.com
```

### Step 5: Test Your Deployment
Visit: `https://your-domain.com/api/health`
Should return: `{"status":"OK","message":"Twitter Clone API is running"}`

## 🎉 You're Live!

Your Twitter clone is now deployed with:
- ✅ User authentication
- ✅ Tweet creation and feeds
- ✅ Real-time messaging
- ✅ File uploads
- ✅ Security headers
- ✅ Rate limiting
- ✅ Error handling

## Need Help?
- Read the full [DEPLOYMENT.md](./DEPLOYMENT.md) guide
- Check platform-specific logs for errors
- Ensure MongoDB Atlas IP whitelist allows your deployment platform

## Local Development
```bash
npm run install-deps  # Install all dependencies
npm run setup-env     # Set up environment files
npm run dev          # Start both frontend and backend
``` 