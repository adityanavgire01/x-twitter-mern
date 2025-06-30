import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/auth';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import TweetFeed from './components/tweets/TweetFeed';
import TweetDetail from './components/tweets/TweetDetail';
import Profile from './components/profile/Profile';
import Navbar from './components/layout/Navbar';
import Search from './components/search/Search';
import './App.css';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return !token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route 
                path="/register" 
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/" 
                element={
                  <PrivateRoute>
                    <TweetFeed />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/tweet/:tweetId" 
                element={
                  <PrivateRoute>
                    <TweetDetail />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/profile/:identifier" 
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/search" 
                element={
                  <PrivateRoute>
                    <Search />
                  </PrivateRoute>
                } 
              />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
