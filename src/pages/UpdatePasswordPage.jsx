// src/pages/UpdatePasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './LoginPage.css'; // We can reuse the login page styles

function UpdatePasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [error, setError] = useState('');

  // This effect will run once on page load to check for the session hash
  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      // This event fires when the user is authenticated from the URL hash
      if (event === "PASSWORD_RECOVERY") {
        // You could potentially do something here, but the session is now active
        // which is the main goal.
      }
    });
  }, []);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    setError('');

    if (password.length < 6) {
        setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
        setLoading(false);
        return;
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Password updated successfully! Redirecting you to the dashboard...' });
      setTimeout(() => navigate('/dashboard'), 2000);
    }
    setLoading(false);
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card">
        <div className="login-header">
          <h2>Set a New Password</h2>
          <p>Enter your new password below to regain access to your account.</p>
        </div>

        <form onSubmit={handlePasswordUpdate} className="login-form">
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          {message.text && (
            <p className={`auth-message ${message.type}`}>
              {message.text}
            </p>
          )}
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UpdatePasswordPage;