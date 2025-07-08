# Local Development Setup - Clean & Simple

## 🎯 What We Cleaned Up

This branch (`feature/safe/profile-upload`) is now configured for **pure local development** with all production complexities removed.

### ❌ Removed Production Code:
- **Helmet security middleware** - Not needed for local dev
- **Compression middleware** - Not needed for local dev  
- **Rate limiting** - Not needed for local dev
- **Complex CORS** - Simplified to localhost only
- **Production static file serving** - Simplified
- **React app serving** - Frontend runs separately
- **Production build optimizations** - Removed from Vite config
- **Complex error handling** - Simplified for development

### ✅ Simplified For Local Development:
- **Environment**: `NODE_ENV=development`
- **CORS**: Only `localhost:5173` and `localhost:3000`
- **MongoDB**: Uses dev database (`twitter-clone-dev`)
- **URLs**: All HTTP localhost URLs
- **Error handling**: Full stack traces for debugging
- **Static files**: Simple express.static()

## 🚀 How to Run Locally

### 1. Update Environment Files

**Update `server/.env`:**
```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://adityapnavgire:G0hFjXP4VsykYzlF@x-twitter-mern-cluster1.gxwbebb.mongodb.net/twitter-clone-dev?retryWrites=true&w=majority
JWT_SECRET=local_dev_jwt_secret_for_testing_only
CLIENT_URL=http://localhost:5173
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

**Update `client/.env`:**
```bash
VITE_API_URL=http://localhost:5000/api
VITE_BASE_URL=http://localhost:5000
```

### 2. Start Backend
```bash
cd server
npm install
npm run dev
```

**Expected output:**
```
Server running on port 5000
Environment: development
Static files will be served from: [path]/uploads
Connected to MongoDB
```

### 3. Start Frontend
```bash
cd client
npm install
npm run dev
```

**Expected output:**
```
Local:   http://localhost:5173/
```

## 🧪 Testing Profile Upload

### Health Check (No Auth Required):
```
http://localhost:5000/api/users/upload-system-health
```

### Test Cases:
- ✅ **Small image** (< 1MB) - Should work
- ✅ **Large file** (> 5MB) - Should fail gracefully  
- ✅ **Wrong file type** (.txt) - Should reject
- ✅ **Error recovery** - Should cleanup failed uploads

### Expected Behavior:
- **Profile images** display at `http://localhost:5000/uploads/filename.jpg`
- **No CORS errors** in browser console
- **Detailed logs** in backend terminal
- **Graceful error handling** with clear messages

## 📋 Benefits of This Clean Setup

1. **Fast startup** - No production middleware overhead
2. **Clear debugging** - Full error stacks and logs
3. **Simple CORS** - No complex origin checking
4. **Separate databases** - Won't affect production data
5. **Hot reloading** - Fast development cycle
6. **Easy testing** - All features work locally

## 🔄 When Ready for Production

1. **Test everything locally first**
2. **Commit to feature branch**
3. **Merge to develop**
4. **Merge to main** (triggers production deploy)
5. **Production uses original complex configuration**

## ⚠️ Important Notes

- This setup is **ONLY for local development**
- **Production code** remains safe on `main` branch
- **Never deploy this simplified code** to production
- **Use separate dev database** to avoid affecting production

---
*This clean setup lets you develop and test safely without production complexities.* 