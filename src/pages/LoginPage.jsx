// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import './LoginPage.css';

function LoginPage() {
  const { session } = useAuth();
  const navigate = useNavigate();

  const [view, setView] = useState('sign_in'); // 'sign_in', 'sign_up', or 'forgot_password'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Redirect if user is already logged in
  useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);

  const handleAuthAction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (view === 'sign_up') {
      // --- SIMPLE CLIENT-SIDE SIGNUP ---
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        // This will catch real errors, but not "User already exists"
        setMessage({ type: 'error', text: error.message });
      } else {
        // Supabase returns a user object even if it exists, to prevent enumeration.
        // We will show a generic success message that covers both cases.
        setMessage({ type: 'success', text: 'If an account for this email is new, a confirmation link has been sent. If you already have an account, you will receive a password reset link instead.' });
        setView('sign_in'); // Guide them back to the sign-in page
      }

    } else if (view === 'sign_in') {
      // --- STANDARD SIGN IN ---
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        setMessage({ type: 'error', text: error.message }); // e.g., "Invalid login credentials"
      } else {
        navigate('/dashboard');
      }
    } else if (view === 'forgot_password') {
        // --- STANDARD PASSWORD RESET ---
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password`,
        });

        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            // Always show a generic success message
            setMessage({ type: 'success', text: 'If an account with this email exists, a password reset link has been sent.' });
        }
    }
    setLoading(false);
  };

  const switchView = (newView) => {
    setView(newView);
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="login-page-wrapper">
      <motion.div
        className="login-card"
        key={view}
        initial={{ opacity: 0, y: -20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="login-header">
          <h2>{view === 'sign_in' ? 'Welcome Back' : view === 'sign_up' ? 'Create Your Account' : 'Reset Password'}</h2>
          <p>{view === 'forgot_password' ? 'Enter your email to receive a reset link.' : 'Enter your details below to continue.'}</p>
        </div>
        
        <form onSubmit={handleAuthAction} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
          </div>
          
          {view !== 'forgot_password' && (
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>
          )}

          {view === 'sign_in' && (
            <div className="forgot-password-link">
                <button type="button" onClick={() => switchView('forgot_password')}>Forgot your password?</button>
            </div>
          )}

          <AnimatePresence>
            {message.text && (
              <motion.p className={`auth-message ${message.type}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {message.text}
              </motion.p>
            )}
          </AnimatePresence>
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Processing...' : (view === 'sign_in' ? 'Sign In' : view === 'sign_up' ? 'Create Account' : 'Send Reset Link')}
          </button>
        </form>

        <div className="auth-toggle">
            {view === 'sign_in' && (<>Don't have an account? <button onClick={() => switchView('sign_up')} className="toggle-button">Sign Up</button></>)}
            {view === 'sign_up' && (<>Already have an account? <button onClick={() => switchView('sign_in')} className="toggle-button">Sign In</button></>)}
            {view === 'forgot_password' && (<>Remembered your password? <button onClick={() => switchView('sign_in')} className="toggle-button">Sign In</button></>)}
        </div>
      </motion.div>
    </div>
  );
}

export default LoginPage;