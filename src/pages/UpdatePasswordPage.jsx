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
  const [hasValidSession, setHasValidSession] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Prevent navigation to other pages - block browser back button and direct navigation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    const handlePopState = (e) => {
      e.preventDefault();
      window.history.pushState(null, '', window.location.href);
    };

    // Push current state to prevent back navigation
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Enhanced password validation
  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('Password must be at least 8 characters long');
    if (!/(?=.*[a-z])/.test(password)) errors.push('Password must contain at least one lowercase letter');
    if (!/(?=.*[A-Z])/.test(password)) errors.push('Password must contain at least one uppercase letter');
    if (!/(?=.*\d)/.test(password)) errors.push('Password must contain at least one number');
    if (!/(?=.*[@$!%*?&])/.test(password)) errors.push('Password must contain at least one special character');
    return errors;
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!password) {
      errors.password = 'Password is required';
    } else {
      const passwordErrors = validatePassword(password);
      if (passwordErrors.length > 0) {
        errors.password = passwordErrors[0];
      }
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Password strength indicator
  const getPasswordStrength = (password) => {
    const errors = validatePassword(password);
    if (!password) return { strength: 'none', color: 'transparent' };
    if (errors.length > 3) return { strength: 'weak', color: '#ef4444' };
    if (errors.length > 1) return { strength: 'medium', color: '#f59e0b' };
    if (errors.length === 1) return { strength: 'good', color: '#10b981' };
    return { strength: 'strong', color: '#059669' };
  };

  // Simple but effective session validation
  const validateSession = async () => {
    try {
      setSessionLoading(true);
      
      // Debug: Log the current URL to understand what tokens we have
      console.log('Current URL:', window.location.href);
      console.log('URL Hash:', window.location.hash);
      console.log('URL Search:', window.location.search);
      
      // Check for Supabase error states first
      const hash = window.location.hash;
      const search = window.location.search;
      const urlString = hash + search;
      
      // Check for specific Supabase errors
      if (urlString.includes('error=access_denied')) {
        if (urlString.includes('otp_expired')) {
          console.log('Password reset link has expired');
          setMessage({ 
            type: 'error', 
            text: 'This password reset link has expired. Please request a new password reset from the login page.' 
          });
        } else if (urlString.includes('invalid_request')) {
          console.log('Invalid password reset request');
          setMessage({ 
            type: 'error', 
            text: 'This password reset link is invalid. Please request a new password reset from the login page.' 
          });
        } else {
          console.log('Access denied error in URL');
          setMessage({ 
            type: 'error', 
            text: 'Access denied. Please request a new password reset from the login page.' 
          });
        }
        setTimeout(() => navigate('/login'), 4000);
        return;
      }
      
      // Check URL for recovery-related tokens in both hash and search params
      const hasToken = urlString.includes('access_token') || 
                      urlString.includes('refresh_token') || 
                      urlString.includes('type=recovery') ||
                      urlString.includes('type=reset') ||
                      urlString.includes('token=') ||
                      urlString.includes('recovery');
      
      if (!hasToken) {
        console.log('No recovery token found in URL');
        setMessage({ 
          type: 'error', 
          text: 'No password reset token found. Please use the link from your email.' 
        });
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      console.log('Recovery token detected, waiting for Supabase to process...');
      // Wait a moment for Supabase to process the URL
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check current session multiple times with retries
      let session = null;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!session && attempts < maxAttempts) {
        attempts++;
        console.log(`Session check attempt ${attempts}/${maxAttempts}`);
        
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (currentSession && currentSession.user) {
          session = currentSession;
          break;
        }
        
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (!session || !session.user) {
        console.log('No valid session found after retries');
        setMessage({ 
          type: 'error', 
          text: 'Invalid or expired session. Please request a new password reset.' 
        });
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      console.log('Valid session found for user:', session.user.email);
      // Success - we have a valid session
      setHasValidSession(true);
      setMessage({ 
        type: 'success', 
        text: `Password reset session active for ${session.user.email}` 
      });

    } catch (error) {
      console.error('Session validation error:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to validate session. Please try the password reset link again.' 
      });
      setTimeout(() => navigate('/login'), 3000);
    } finally {
      setSessionLoading(false);
    }
  };

  // Initialize session validation and auth monitoring
  useEffect(() => {
    validateSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event);
      
      if (event === "PASSWORD_RECOVERY" && session) {
        setHasValidSession(true);
        setMessage({ 
          type: 'success', 
          text: `Ready to update password for ${session.user.email}` 
        });
      } else if (event === "SIGNED_IN" && session?.user?.email_confirmed_at) {
        // User successfully updated password and is now signed in
        setTimeout(() => navigate('/dashboard'), 1000);
      } else if (event === "SIGNED_OUT") {
        // Session ended - redirect to login
        navigate('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (!hasValidSession) {
      setMessage({ 
        type: 'error', 
        text: 'Invalid session. Please click the password reset link again.' 
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Double-check session before updating
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        setMessage({ 
          type: 'error', 
          text: 'Session expired. Please request a new password reset.' 
        });
        setLoading(false);
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      // Update password
      const { data, error } = await supabase.auth.updateUser({
        password: password.trim(),
      });

      if (error) {
        if (error.message.includes('same as the old password')) {
          setMessage({ 
            type: 'error', 
            text: 'New password must be different from your current password.' 
          });
        } else {
          setMessage({ 
            type: 'error', 
            text: error.message || 'Failed to update password. Please try again.' 
          });
        }
      } else {
        setMessage({ 
          type: 'success', 
          text: 'Password updated successfully! Signing you out for security...' 
        });
        
        // Clear form
        setPassword('');
        setConfirmPassword('');
        
        // Sign out and redirect
        setTimeout(async () => {
          await supabase.auth.signOut();
          navigate('/login');
        }, 2500);
      }
    } catch (error) {
      console.error('Password update error:', error);
      setMessage({ 
        type: 'error', 
        text: 'An unexpected error occurred. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading screen while validating session
  if (sessionLoading) {
    return (
      <div className="login-page-wrapper">
        <motion.div
          className="login-card"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="login-header">
            <h2>Validating Session</h2>
            <p>Please wait while we verify your password reset request...</p>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginTop: '2rem' 
            }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                border: '3px solid #e5e7eb', 
                borderTop: '3px solid #3b82f6', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite' 
              }}></div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show error screen if session is invalid
  if (!hasValidSession) {
    const isExpiredLink = message.text && message.text.includes('expired');
    
    return (
      <div className="login-page-wrapper">
        <motion.div
          className="login-card"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="login-header">
            <h2>{isExpiredLink ? 'Link Expired' : 'Session Invalid'}</h2>
            <p>
              {isExpiredLink 
                ? 'Your password reset link has expired. These links are only valid for a short time for security reasons.'
                : 'Your password reset session is invalid or has expired.'
              }
            </p>
          </div>
          
          {message.text && (
            <motion.p className={`auth-message ${message.type}`}>
              {message.text}
            </motion.p>
          )}
          
          <div style={{ textAlign: 'center', marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button 
              onClick={() => navigate('/login')} 
              className="btn btn-primary"
            >
              {isExpiredLink ? 'Request New Password Reset' : 'Back to Login'}
            </button>
            
            {isExpiredLink && (
              <>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Don't worry! Simply go to the login page and click "Forgot Password" to get a new reset link.
                </p>
                <div style={{ 
                  padding: '1rem', 
                  backgroundColor: 'var(--bg-secondary)', 
                  borderRadius: '8px', 
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  textAlign: 'left'
                }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '0.9rem' }}>Tips to avoid expiration:</h4>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                    <li>Click the reset link within 5-10 minutes of receiving it</li>
                    <li>Don't open the email in preview mode - open it fully</li>
                    <li>Check your spam folder if you don't see the new email</li>
                    <li>Try using a different browser if the issue persists</li>
                  </ul>
                </div>
              </>
            )}
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
          <h2>Set a New Password</h2>
          <p>Your session is verified. Please enter and confirm your new password below.</p>
        </div>

        <form onSubmit={handlePasswordUpdate} className="login-form" noValidate>
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className={validationErrors.password ? 'error' : ''}
                aria-describedby={validationErrors.password ? 'password-error' : undefined}
                autoComplete="new-password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  fontSize: '14px'
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️‍🗨️' : '👁️'}
              </button>
            </div>
            {validationErrors.password && (
              <span id="password-error" className="field-error">{validationErrors.password}</span>
            )}
            {password && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ 
                  height: '4px', 
                  backgroundColor: '#e5e7eb', 
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.max(20, (5 - validatePassword(password).length) * 25)}%`,
                    backgroundColor: getPasswordStrength(password).color,
                    transition: 'all 0.3s ease'
                  }}></div>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                  Password strength: {getPasswordStrength(password).strength}
                </span>
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              className={validationErrors.confirmPassword ? 'error' : ''}
              aria-describedby={validationErrors.confirmPassword ? 'confirm-password-error' : undefined}
              autoComplete="new-password"
              disabled={loading}
            />
            {validationErrors.confirmPassword && (
              <span id="confirm-password-error" className="field-error">{validationErrors.confirmPassword}</span>
            )}
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
            disabled={loading || !hasValidSession}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '16px', border: '2px solid #ffffff40', borderTop: '2px solid #ffffff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                Updating Password...
              </span>
            ) : (
              'Update Password'
            )}
          </button>
        </form>

        <div style={{ 
          marginTop: '1.5rem', 
          padding: '1rem', 
          backgroundColor: 'var(--bg-primary)', 
          borderRadius: '8px',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Password Requirements:</h4>
          <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
            <li>At least 8 characters long</li>
            <li>Contains uppercase and lowercase letters</li>
            <li>Contains at least one number</li>
            <li>Contains at least one special character</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}

export default UpdatePasswordPage;