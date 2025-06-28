import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import './styles/global.css';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import { AuthProvider, useAuth } from './context/AuthContext';

// Placeholder components (we'll create these next)
const Home = () => <div>Home Page</div>;
const Profile = () => <div>Profile Page</div>;

function AppRoutes() {
  const { user, checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={!user ? <Login /> : <Navigate to="/" />} 
      />
      <Route 
        path="/register" 
        element={!user ? <Register /> : <Navigate to="/" />} 
      />

      {/* Protected Routes */}
      <Route 
        path="/" 
        element={user ? <Home /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/profile/:username" 
        element={user ? <Profile /> : <Navigate to="/login" />} 
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
