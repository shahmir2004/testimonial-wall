// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ThemeToggleButton from './components/ThemeToggleButton.jsx';


// Pages
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import AccountPage from './pages/AccountPage.jsx';
import UpdatePasswordPage from './pages/UpdatePasswordPage.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';


// --- Layout Components ---
const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/'); // Redirect to homepage on sign out
  };

  return (
    <motion.header
      className="main-header"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="container header-container">
        <Link to="/" className="logo">
          Testimonial Wall
        </Link>
        <nav className="main-nav">
          {user ? (
            <>
              <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
              <NavLink to="/account" className="nav-link">Account</NavLink>
              <button onClick={handleSignOut} className="nav-link-button">Logout</button>
              <ThemeToggleButton />
            </>
          ) : (
            <NavLink to="/login" className="nav-link btn btn-primary">Login / Sign Up</NavLink>
          )}
        </nav>
      </div>
    </motion.header>
  );
};

const Footer = () => (
  <footer className="main-footer">
    <div className="container footer-container">
      <p>© {new Date().getFullYear()} Testimonial Wall by Shahmir Ahmed. All rights reserved.</p>
    </div>
  </footer>
);

// Wrapper for consistent page animations and layout
const PageLayout = ({ children }) => {
    const location = useLocation();
    return (
        <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
            {children}
        </motion.div>
    );
};


// --- Main App Component ---
function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <main>
          <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<PageLayout><HomePage /></PageLayout>} />
                <Route path="/login" element={<PageLayout><LoginPage /></PageLayout>} />
                  <Route path="/update-password" element={<PageLayout><UpdatePasswordPage /></PageLayout>} />
                <Route path="/dashboard" element={<ProtectedRoute><PageLayout><DashboardPage /></PageLayout></ProtectedRoute>} />
                <Route path="/account" element={<ProtectedRoute><PageLayout><AccountPage /></PageLayout></ProtectedRoute>} />
              </Routes>
          </AnimatePresence>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;