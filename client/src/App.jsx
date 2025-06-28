import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/global.css';
import Login from './components/auth/Login';

// Placeholder components (we'll create these next)
const Home = () => <div>Home Page</div>;
const Register = () => <div>Register Page</div>;
const Profile = () => <div>Profile Page</div>;

function App() {
  // Placeholder for auth state
  const isAuthenticated = false;

  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login /> : <Navigate to="/" />} 
          />
          <Route 
            path="/register" 
            element={!isAuthenticated ? <Register /> : <Navigate to="/" />} 
          />

          {/* Protected Routes */}
          <Route 
            path="/" 
            element={isAuthenticated ? <Home /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/profile/:username" 
            element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
