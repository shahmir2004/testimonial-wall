// src/pages/MagicLinkAuth.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import './LoginPage.css';

function MagicLinkAuth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [emailSent, setEmailSent] = useState(false);

  const handleMagicLink = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.toLowerCase().trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard?magic_link=true`,
        }
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setEmailSent(true);
        setMessage({ 
          type: 'success', 
          text: 'Magic link sent! Check your email and click the link to sign in.' 
        });
      }
    } catch (error) {
      console.error('Magic link error:', error);
      setMessage({ 
        type: 'error', 
        text: 'An unexpected error occurred. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="login-page-wrapper">
        <motion.div
          className="login-card"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="login-header">
            <h2>Check Your Email</h2>
            <p>We've sent a magic link to <strong>{email}</strong></p>
          </div>
          
          <div style={{ 
            padding: '1.5rem', 
            backgroundColor: 'var(--bg-secondary)', 
            borderRadius: '8px', 
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            <p style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>
              Click the link in your email to sign in instantly. No password required!
            </p>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              The link will expire in 1 hour for security. After signing in, you'll see an option to set up a password for traditional login access.
            </p>
          </div>

          {message.text && (
            <motion.p className={`auth-message ${message.type}`}>
              {message.text}
            </motion.p>
          )}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button 
              onClick={() => {
                setEmailSent(false);
                setEmail('');
                setMessage({ type: '', text: '' });
              }}
              className="btn btn-secondary"
            >
              Use Different Email
            </button>
            
            <button 
              onClick={() => navigate('/login')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Back to Login
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="login-page-wrapper">
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="login-header">
          <h2>Magic Link Sign In</h2>
          <p>Enter your email and we'll send you a secure link to sign in instantly</p>
        </div>

        <form onSubmit={handleMagicLink} className="login-form" noValidate>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <AnimatePresence>
            {message.text && (
              <motion.p
                className={`auth-message ${message.type}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {message.text}
              </motion.p>
            )}
          </AnimatePresence>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '16px', border: '2px solid #ffffff40', borderTop: '2px solid #ffffff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                Sending Magic Link...
              </span>
            ) : (
              'Send Magic Link'
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button 
            onClick={() => navigate('/login')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Back to Login
          </button>
        </div>

        <div style={{ 
          marginTop: '1.5rem', 
          padding: '1rem', 
          backgroundColor: 'var(--bg-primary)', 
          borderRadius: '8px',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Why Magic Links?</h4>
          <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
            <li>No password to remember or reset</li>
            <li>More secure than traditional passwords</li>
            <li>Works instantly without typing</li>
            <li>No expiration issues like password resets</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}

export default MagicLinkAuth;
