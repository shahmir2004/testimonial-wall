// src/pages/LoginPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import './LoginPage.css';

function LoginPage() {
  const { session } = useAuth();
  const navigate = useNavigate();

  const [view, setView] = useState('sign_in'); // 'sign_in', 'sign_up', 'check_email'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [checkEmailAddress, setCheckEmailAddress] = useState('');
  const [emailExists, setEmailExists] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [rateLimitCooldown, setRateLimitCooldown] = useState(0);

  // Redirect if user is already logged in
  useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);

  // Rate limiting cooldown effect
  useEffect(() => {
    if (rateLimitCooldown > 0) {
      const timer = setTimeout(() => {
        setRateLimitCooldown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [rateLimitCooldown]);

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Password strength validation
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
    
    if (!email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
        errors.password = 'Password is required';
      } else if (view === 'sign_up') {
        const passwordErrors = validatePassword(password);
        if (passwordErrors.length > 0) {
          errors.password = passwordErrors[0]; // Show first error
        }
      }

      if (view === 'sign_up' && password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Email existence check using Supabase Edge Function
  const checkEmailExists = useCallback(async (emailToCheck) => {
    if (!emailRegex.test(emailToCheck)) return;
    
    setEmailChecking(true);
    try {
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('check-email', {
        body: { email: emailToCheck }
      });
      
      if (error) {
        console.error('Email check error:', error);
        setEmailExists(null);
      } else {
        setEmailExists(data.exists);
      }
    } catch (error) {
      console.error('Email check error:', error);
      setEmailExists(null);
    } finally {
      setEmailChecking(false);
    }
  }, []);

  // Debounce email check
  useEffect(() => {
    if (email && view === 'sign_up') {
      const timer = setTimeout(() => {
        checkEmailExists(email);
      }, 1000); // Wait 1 second after user stops typing
      return () => clearTimeout(timer);
    } else {
      setEmailExists(null);
    }
  }, [email, view, checkEmailExists]);

  const handleAuthAction = async (e) => {
    e.preventDefault();
    
    // Check rate limiting
    if (rateLimitCooldown > 0) {
      setMessage({ 
        type: 'error', 
        text: `Please wait ${rateLimitCooldown} seconds before trying again.` 
      });
      return;
    }

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (view === 'sign_up') {
        // Check if email already exists before attempting signup
        if (emailExists === true) {
          setMessage({
            type: 'error',
            text: 'This email is already registered. Please sign in or reset your password.'
          });
          setRateLimitCooldown(5);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.toLowerCase().trim(),
          password: password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              email_confirm: true
            }
          }
        });

        if (error) {
          if (error.message.includes('already registered')) {
            setMessage({
              type: 'error',
              text: 'This email is already registered. Please sign in or reset your password.'
            });
            setEmailExists(true);
          } else {
            setMessage({ type: 'error', text: error.message });
          }
          setRateLimitCooldown(5);
        } else if (data.user) {
          // Check if user needs email confirmation
          if (data.user.email_confirmed_at) {
            // User is immediately confirmed, redirect to dashboard
            navigate('/dashboard');
          } else {
            // User needs to confirm email
            setCheckEmailAddress(email);
            setView('check_email');
            setMessage({
              type: 'success',
              text: 'Account created successfully! Please check your email to confirm your account.'
            });
          }
        }

      } else if (view === 'sign_in') {
        const { data, error } = await supabase.auth.signInWithPassword({ 
          email: email.toLowerCase().trim(), 
          password: password 
        });
        
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setMessage({ 
              type: 'error', 
              text: 'Invalid email or password. Please check your credentials and try again.' 
            });
          } else if (error.message.includes('Email not confirmed')) {
            setMessage({ 
              type: 'error', 
              text: 'Please check your email and click the confirmation link before signing in.' 
            });
          } else {
            setMessage({ type: 'error', text: error.message });
          }
          setRateLimitCooldown(3);
        } else if (data.user) {
          setMessage({ type: 'success', text: 'Signed in successfully!' });
          setTimeout(() => navigate('/dashboard'), 500);
        }

      }
    } catch (error) {
      console.error('Auth error:', error);
      setMessage({ 
        type: 'error', 
        text: 'An unexpected error occurred. Please try again.' 
      });
      setRateLimitCooldown(5);
    } finally {
      setLoading(false);
    }
  };

  const switchView = (newView) => {
    setView(newView);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setMessage({ type: '', text: '' });
    setValidationErrors({});
    setEmailExists(null);
    setRateLimitCooldown(0);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Get password strength indicator
  const getPasswordStrength = (password) => {
    const errors = validatePassword(password);
    if (!password) return { strength: 'none', color: 'transparent' };
    if (errors.length > 3) return { strength: 'weak', color: '#ef4444' };
    if (errors.length > 1) return { strength: 'medium', color: '#f59e0b' };
    if (errors.length === 1) return { strength: 'good', color: '#10b981' };
    return { strength: 'strong', color: '#059669' };
  };

  // Handle resend email functionality
  const handleResendEmail = async () => {
    if (rateLimitCooldown > 0 || loading) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (view === 'check_email') {
        // Resend signup confirmation email
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: checkEmailAddress.toLowerCase().trim(),
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        });
        
        if (error) {
          setMessage({ type: 'error', text: error.message });
        } else {
          setMessage({ type: 'success', text: 'Confirmation email resent successfully!' });
        }
      }
      
      setRateLimitCooldown(30); // 30 second cooldown for resend
    } catch (error) {
      console.error('Resend error:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to resend email. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER LOGIC ---
  if (view === 'check_email') {
    return (
      <div className="login-page-wrapper">
        <motion.div className="login-card" initial={{opacity:0}} animate={{opacity:1}}>
          <div className="login-header check-email-header">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h2>Check Your Inbox</h2>
            <p>
              We've sent a secure link to <strong>{checkEmailAddress}</strong>. 
              Please click the link to confirm your account and complete the sign-up process.
            </p>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Didn't receive the email? Check your spam folder or{' '}
              <button 
                onClick={handleResendEmail}
                style={{ 
                  color: 'var(--text-accent)', 
                  textDecoration: 'underline', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 'inherit'
                }}
                disabled={loading || rateLimitCooldown > 0}
              >
                {rateLimitCooldown > 0 ? `resend in ${rateLimitCooldown}s` : loading ? 'sending...' : 'resend email'}
              </button>
            </p>
          </div>
          <div className="auth-toggle">
            <button onClick={() => switchView('sign_in')} className="toggle-button">Back to Sign In</button>
          </div>
          {message.text && (
            <motion.p className={`auth-message ${message.type}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {message.text}
            </motion.p>
          )}
        </motion.div>
      </div>
    );
  }

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
          <h2>{view === 'sign_in' ? 'Welcome Back' : 'Create Your Account'}</h2>
          <p>Enter your details below to continue.</p>
        </div>
        
        <form onSubmit={handleAuthAction} className="login-form" noValidate>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="you@example.com"
                className={validationErrors.email ? 'error' : ''}
                aria-describedby={validationErrors.email ? 'email-error' : undefined}
                autoComplete="email"
              />
              {view === 'sign_up' && email && emailRegex.test(email) && (
                <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                  {emailChecking ? (
                    <div style={{ 
                      width: '16px', 
                      height: '16px', 
                      border: '2px solid #e5e7eb', 
                      borderTop: '2px solid #3b82f6', 
                      borderRadius: '50%', 
                      animation: 'spin 1s linear infinite' 
                    }}></div>
                  ) : emailExists === true ? (
                    <span style={{ color: '#ef4444', fontSize: '16px', fontWeight: 'bold' }} title="Email already exists">✗</span>
                  ) : emailExists === false ? (
                    <span style={{ color: '#10b981', fontSize: '16px', fontWeight: 'bold' }} title="Email available">✓</span>
                  ) : null}
                </div>
              )}
            </div>
            {validationErrors.email && (
              <span id="email-error" className="field-error">{validationErrors.email}</span>
            )}
            {view === 'sign_up' && emailExists === true && (
              <span className="field-error">This email is already registered. Try signing in instead.</span>
            )}
          </div>
          
          <div className="form-group">
              <label htmlFor="password">Password</label>
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
                  autoComplete={view === 'sign_up' ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
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
              {view === 'sign_up' && password && (
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

          {view === 'sign_up' && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
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
              />
              {validationErrors.confirmPassword && (
                <span id="confirm-password-error" className="field-error">{validationErrors.confirmPassword}</span>
              )}
            </div>
          )}

          <AnimatePresence>
            {message.text && (
              <motion.p className={`auth-message ${message.type}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {message.text}
              </motion.p>
            )}
          </AnimatePresence>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading || rateLimitCooldown > 0}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '16px', border: '2px solid #ffffff40', borderTop: '2px solid #ffffff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                {view === 'sign_in' ? 'Signing In...' : 'Creating Account...'}
              </span>
            ) : rateLimitCooldown > 0 ? (
              `Please wait ${rateLimitCooldown}s`
            ) : (
              view === 'sign_in' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        {view === 'sign_in' && (
          <div style={{ 
            marginTop: '1.5rem', 
            padding: '1rem', 
            backgroundColor: 'var(--bg-secondary)', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
              Forgot your password?
            </h4>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Use Magic Link instead - sign in without a password!
            </p>
            <button 
              onClick={() => navigate('/magic-link')}
              className="btn btn-secondary"
              style={{ width: '100%', fontSize: '0.9rem' }}
            >
              🪄 Sign In with Magic Link
            </button>
          </div>
        )}

        <div className="auth-toggle">
            {view === 'sign_in' && (<>Don't have an account? <button onClick={() => switchView('sign_up')} className="toggle-button">Sign Up</button></>)}
            {view === 'sign_up' && (<>Already have an account? <button onClick={() => switchView('sign_in')} className="toggle-button">Sign In</button></>)}
        </div>
      </motion.div>
    </div>
  );
}

export default LoginPage;