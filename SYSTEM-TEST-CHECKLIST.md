# X-Twitter Clone - System Testing Checklist ✅

## 🏥 **Health Checks**
- [ ] **Backend Health**: `http://localhost:5000/api/users/upload-system-health` (no auth required)
- [ ] **Upload Health**: `http://localhost:5000/api/users/test-upload-health` (requires login)
- [ ] **Server Logs**: No JWT signature errors after clearing tokens

## 🔐 **Authentication System**
- [ ] **User Registration**: Create new account
- [ ] **User Login**: Login with existing account  
- [ ] **Token Persistence**: Page refresh keeps you logged in
- [ ] **Logout**: Logout works and clears tokens
- [ ] **Protected Routes**: Cannot access features without login

## 👤 **Profile Management**
- [ ] **Profile View**: View your own profile
- [ ] **Profile Edit**: Update name, bio, location, website
- [ ] **Profile Image Upload**: Upload new profile picture
  - [ ] JPEG files work
  - [ ] PNG files work
  - [ ] Large files (>5MB) are rejected
  - [ ] Invalid file types are rejected
  - [ ] Profile image shows in navbar
  - [ ] Profile image shows in profile page
  - [ ] Profile image shows in tweets
  - [ ] Profile image shows in messages dropdown
  - [ ] Profile image shows in search results

## 🐦 **Tweet Functionality**
- [ ] **Create Tweet**: Post new tweets
- [ ] **View Feed**: See tweets in timeline
- [ ] **Tweet Details**: Click to view individual tweets
- [ ] **User Tweets**: View tweets from specific users
- [ ] **Tweet Images**: Profile pictures show correctly in tweets

## 💬 **Messaging System**
- [ ] **Messages Panel**: Open messages from main app
- [ ] **New Message**: Click + button to start new conversation
- [ ] **User Search**: Search people you follow
- [ ] **Profile Pictures**: Profile images show in search dropdown
- [ ] **Start Conversation**: Select user to start chatting
- [ ] **Send Messages**: Send and receive messages
- [ ] **Message History**: View conversation history

## 🔍 **Search System**
- [ ] **Search Users**: Find users by username/name
- [ ] **Search Tweets**: Find tweets by content
- [ ] **Profile Pictures**: Images show in search results
- [ ] **Search Navigation**: Click results to visit profiles

## 👥 **Social Features**
- [ ] **Follow/Unfollow**: Follow and unfollow users
- [ ] **Followers List**: View who follows you
- [ ] **Following List**: View who you follow
- [ ] **User Profiles**: Visit other user profiles

## 🗄️ **Database Operations**
- [ ] **Dev Database**: Confirm using `twitter-clone-dev` database
- [ ] **Data Persistence**: Data saves and loads correctly
- [ ] **File Storage**: Profile images save to `server/uploads/`

## 🔧 **Error Handling**
- [ ] **Upload Errors**: Graceful handling of upload failures
- [ ] **Network Errors**: App handles connection issues
- [ ] **Invalid Data**: Form validation works
- [ ] **File Cleanup**: Failed uploads don't leave orphaned files

## 📱 **User Experience**
- [ ] **Responsive Design**: Works on different screen sizes
- [ ] **Loading States**: Shows loading indicators
- [ ] **Error Messages**: Clear error messages to users
- [ ] **Navigation**: Smooth navigation between pages

---

## ✅ **Sign-off**
- [ ] All critical features tested and working
- [ ] No console errors in browser
- [ ] No server errors in terminal
- [ ] Ready for production deployment

**Tested by:** _______________  
**Date:** _______________  
**Notes:** _______________ 