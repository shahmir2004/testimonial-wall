// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; // Import AuthProvider and useAuth

// Import Page Components
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AccountPage from './pages/AccountPage';
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute

// Main App component wrapped with Router
function App() {
  return (
    <AuthProvider> {/* Wrap everything in AuthProvider */}
      <Router>
        <div>
          <Navigation /> {/* Use a separate component for nav to access auth context */}
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
              />
              <Route
                path="/account"
                element={<ProtectedRoute><AccountPage /></ProtectedRoute>}
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Navigation component that can access auth state
function Navigation() {
  const { user, signOut } = useAuth();

  return (
    <nav>
      <ul>
        <li><NavLink to="/" className={({isActive}) => isActive ? "active" : ""}>Home</NavLink></li>
        {/* Show different links based on auth state */}
        {!user ? (
          <li><NavLink to="/login" className={({isActive}) => isActive ? "active" : ""}>Login</NavLink></li>
        ) : (
          <>
            <li><NavLink to="/dashboard" className={({isActive}) => isActive ? "active" : ""}>Dashboard</NavLink></li>
            <li><NavLink to="/account" className={({isActive}) => isActive ? "active" : ""}>Account</NavLink></li>
            <li>
              <button onClick={signOut} style={{background: 'none', border: 'none', color: '#646cff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', padding: 0}}>
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default App;