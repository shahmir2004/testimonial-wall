// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { itemFadeInUpVariants } from '../utils/animationVariants'; // Assuming you have this shared file
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
    setMessage({ type: '', text: '' }); // Clear previous messages

    if (view === 'sign_up') {
      // --- SIGN UP LOGIC ---
      // Call our custom Supabase Edge Function to handle signup
      const { data, error } = await supabase.functions.invoke('handle-signup', {
        body: { email, password },
      });

      if (error) {
        // This block catches errors from the function invocation itself (e.g., network error)
        // AND errors we return from the function (like "User already exists").
        
        // Check if our custom error message is nested in the context
        if (error.context && error.context.json && error.context.json.error) {
          setMessage({ type: 'error', text: error.context.json.error });
        } else {
          // Fallback for more generic invocation errors
          setMessage({ type: 'error', text: 'This user already exists.' });
        }
        console.error("Edge Function invocation error:", error);
      } else {
        // This block handles the successful 200 OK response from our Edge Function
        setMessage({ type: 'success', text: data.message });
        setView('sign_in'); // Switch to sign-in view after successful signup prompt
      }
    } else if (view === 'sign_in') {
      // --- SIGN IN LOGIC ---
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      
      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        // Successful sign-in will be caught by the onAuthStateChange listener in AuthContext,
        // but we can also navigate immediately for a faster user experience.
        navigate('/dashboard');
      }
    } else if (view === 'forgot_password') {
        // --- FORGOT PASSWORD LOGIC ---
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            // This needs to be a page you create later for users to enter their new password
            redirectTo: `${window.location.origin}/update-password`,
        });

        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            setMessage({ type: 'success', text: 'Password reset link sent! Please check your email.' });
        }
    }
    setLoading(false);
  };

  // Helper function to switch views and clear any existing messages
  const switchView = (newView) => {
    setView(newView);
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="login-page-wrapper">
      <motion.div
        className="login-card"
        key={view} // Force re-render/animation on view change
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
            {loading ? 'Processing...' : (view === 'sign_in' ? 'Sign In' : view === 'sign_up' ? 'Create Account' : 'Send Reset Link')}
          </button>
        </form>

        <div className="auth-toggle">
            {view === 'sign_in' && (
                <>Don't have an account? <button onClick={() => switchView('sign_up')} className="toggle-button">Sign Up</button></>
            )}
            {view === 'sign_up' && (
                <>Already have an account? <button onClick={() => switchView('sign_in')} className="toggle-button">Sign In</button></>
            )}
            {view === 'forgot_password' && (
                <>Remembered your password? <button onClick={() => switchView('sign_in')} className="toggle-button">Sign In</button></>
            )}
        </div>
      </motion.div>
    </div>
  );
}

export default LoginPage;