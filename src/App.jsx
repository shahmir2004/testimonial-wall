// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';

// Import Page Components
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AccountPage from './pages/AccountPage';

function App() {
  return (
    <Router>
      <div>
        {/* Simple Navigation for now */}
        <nav>
          <ul>
            <li><NavLink to="/" className={({isActive}) => isActive ? "active" : ""}>Home</NavLink></li>
            <li><NavLink to="/login" className={({isActive}) => isActive ? "active" : ""}>Login</NavLink></li>
            <li><NavLink to="/dashboard" className={({isActive}) => isActive ? "active" : ""}>Dashboard</NavLink></li>
            <li><NavLink to="/account" className={({isActive}) => isActive ? "active" : ""}>Account</NavLink></li>
          </ul>
        </nav>

        <main>
          {/* Page content will be rendered here */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/account" element={<AccountPage />} />
            {/* Later, we can add a <Route path="*" element={<NotFoundPage />} /> */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;