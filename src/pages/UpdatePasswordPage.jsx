// src/pages/UpdatePasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import './LoginPage.css'; // Reusing the login page styles for a consistent look

function UpdatePasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [hasRecoverySession, setHasRecoverySession] = useState(false);

  // This effect runs once on component mount to check for the session hash from the URL
  // and set up the listener for the PASSWORD_RECOVERY event.
  useEffect(() => {
    // Check for the #access_token in the URL on initial load
    if (window.location.hash.includes('access_token')) {
        // The URL contains a token, so we can expect the PASSWORD_RECOVERY event
        // The form can be shown immediately.
    }
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // This event fires when Supabase processes the #access_token from the URL.
      // After this, we have a temporary, valid session to update the password.
      if (event === "PASSWORD_RECOVERY") {
        setHasRecoverySession(true); // We can use this to enable the form
      }
      
      // If the user somehow becomes fully signed in here, redirect them
      if (event === "SIGNED_IN") {
          navigate('/dashboard');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Client-side validation before making an API call
    if (password.length < 6) {
        setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
        setLoading(false);
        return;
    }
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      setLoading(false);
      return;
    }

    // By the time the user submits, the temporary session is active.
    // We can now call updateUser.
    const { data, error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setMessage({ type: 'error', text: error.message || "Failed to update password." });
    } else {
      setMessage({ type: 'success', text: 'Password updated successfully! Redirecting you to login...' });
      
      // After successfully updating, sign the user out of this temporary recovery session
      // and redirect them to the login page to sign in with their new credentials.
      setTimeout(() => {
        supabase.auth.signOut();
        navigate('/login');
      }, 2500); // 2.5 second delay to allow user to read the success message
    }
    setLoading(false);
  };

  return (
    <div className="login-page-wrapper">
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="login-header">
          <h2>Set a New Password</h2>
          <p>Your session is verified. Please enter and confirm your new password below.</p>
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
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <AnimatePresence>
            {message.text && (
              <motion.p
                className={`auth-message ${message.type}`}
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
              >
                {message.text}
              </motion.p>
            )}
          </AnimatePresence>
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default UpdatePasswordPage;