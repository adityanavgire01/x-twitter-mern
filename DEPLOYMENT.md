# Deployment Guide - Twitter Clone MERN Stack

This guide covers deploying your Twitter clone to various platforms.

## Prerequisites

### 1. MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free account and cluster
3. Get your connection string:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
   ```

### 2. Environment Variables Required

**Server (.env in server folder):**
```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_random_secret_key_32_characters_minimum
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-frontend-domain.com
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

**Client (.env in client folder):**
```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_BASE_URL=https://your-backend-domain.com
```

## Deployment Options

### 1. Heroku (Full Stack)

#### Steps:
1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set environment variables:
   ```bash
   heroku config:set MONGODB_URI="your_connection_string"
   heroku config:set JWT_SECRET="your_secret_key"
   heroku config:set NODE_ENV=production
   heroku config:set CLIENT_URL=https://your-app-name.herokuapp.com
   ```
5. Deploy: `git push heroku main`

### 2. Railway (Full Stack)

#### Steps:
1. Go to [Railway](https://railway.app/)
2. Connect your GitHub repo
3. Set environment variables in Railway dashboard
4. Deploy automatically on git push

### 3. Render (Full Stack)

#### Steps:
1. Go to [Render](https://render.com/)
2. Create a new Web Service from your repo
3. Use these settings:
   - Build Command: `npm run build`
   - Start Command: `npm start`
4. Set environment variables in Render dashboard

### 4. Vercel (Frontend) + Railway/Heroku (Backend)

#### Frontend on Vercel:
1. Go to [Vercel](https://vercel.com/)
2. Import your project
3. Set Root Directory to `client`
4. Set environment variables:
   ```
   VITE_API_URL=https://your-backend-url.com/api
   VITE_BASE_URL=https://your-backend-url.com
   ```

#### Backend on Railway/Heroku (follow steps above)

### 5. Docker Deployment

#### Build and run:
```bash
docker build -t twitter-clone .
docker run -p 5000:5000 --env-file .env twitter-clone
```

#### Using Docker Compose:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=your_connection_string
      - JWT_SECRET=your_secret_key
      - NODE_ENV=production
```

## Important Notes

### File Uploads
- For production, consider using cloud storage (AWS S3, Cloudinary)
- Current setup stores files locally (works for single-server deployments)

### Security
- Never commit `.env` files
- Use strong JWT secrets (32+ characters)
- Enable MongoDB Atlas IP whitelist or use 0.0.0.0/0 for dynamic IPs

### Performance
- The app includes compression and security headers
- Rate limiting is enabled (100 requests per 15 minutes)
- Static files are served efficiently

## Troubleshooting

### Common Issues:
1. **CORS errors**: Check CLIENT_URL environment variable
2. **Database connection**: Verify MONGODB_URI and Atlas IP whitelist
3. **Build failures**: Ensure Node.js version >= 18
4. **File upload issues**: Check UPLOAD_PATH permissions

### Environment Variable Template:
Copy the `.env.example` files and fill in your values:
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

## Post-Deployment

1. Test the health endpoint: `https://your-domain.com/api/health`
2. Verify user registration and login
3. Test file uploads
4. Check messaging functionality

Need help? Check the logs in your deployment platform's dashboard. 