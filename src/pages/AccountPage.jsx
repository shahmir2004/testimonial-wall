// src/pages/AccountPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  itemFadeInUpVariants,
  staggerContainerVariants,
  buttonHoverTapVariants
} from '../utils/animationVariants'; // Make sure this path is correct
import './AccountPage.css'; // Make sure the corresponding CSS file exists

// --- Icon Components (for a polished UI) ---
const IconUser = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const IconLock = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><circle cx="12" cy="16" r="1"></circle><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const IconLogOut = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;

function AccountPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [website, setWebsite] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Password management state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [hasPassword, setHasPassword] = useState(null); // null = checking, true = has password, false = no password

  // Use useCallback to memoize the fetch function
  const getProfile = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, website_url`)
        .eq('id', user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }
      if (data) {
        setUsername(data.username || '');
        setWebsite(data.website_url || '');
      }

      // Check if user has a password set (they might have signed up with Magic Link)
      await checkUserPasswordStatus();
    } catch (error) {
      console.error('Error fetching profile:', error);
      showStatusMessage('Error: Could not load your profile data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Check if user has a password set
  const checkUserPasswordStatus = async () => {
    try {
      // Try to get user metadata to determine if they have a password
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      // Users who signed up with Magic Link or OAuth won't have a password
      // We can check the app_metadata or user_metadata for this info
      // For now, we'll assume they don't have a password if they signed up recently
      // and provide the option to set one
      setHasPassword(true); // Default to true, let them try to change it
    } catch (error) {
      console.error('Error checking password status:', error);
      setHasPassword(true); // Default to true on error
    }
  };

  // Password validation
  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('Password must be at least 8 characters long');
    if (!/(?=.*[a-z])/.test(password)) errors.push('Password must contain at least one lowercase letter');
    if (!/(?=.*[A-Z])/.test(password)) errors.push('Password must contain at least one uppercase letter');
    if (!/(?=.*\d)/.test(password)) errors.push('Password must contain at least one number');
    if (!/(?=.*[@$!%*?&])/.test(password)) errors.push('Password must contain at least one special character');
    return errors;
  };

  // Password strength indicator
  const getPasswordStrength = (password) => {
    const errors = validatePassword(password);
    if (!password) return { strength: 'none', color: 'transparent' };
    if (errors.length > 3) return { strength: 'weak', color: '#ef4444' };
    if (errors.length > 1) return { strength: 'medium', color: '#f59e0b' };
    if (errors.length === 1) return { strength: 'good', color: '#10b981' };
    return { strength: 'strong', color: '#059669' };
  }; // Dependency is the user object

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  const showStatusMessage = (text, type = 'info', duration = 4000) => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage({ text: '', type: '' }), duration);
  };

  const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!user) return;

        setIsUpdating(true);
        setStatusMessage({ type: 'info', text: 'Saving...' });

        // For .update(), the data object should NOT contain the primary key 'id'
        const profileData = {
            username,
            website_url: website,
            updated_at: new Date(),
        };

        try {
            // --- THE DEFINITIVE FIX: Use .update() with an .eq() filter ---
            // This is a pure UPDATE operation, not an UPSERT.
            // It will only be checked against your UPDATE RLS policy.
            const { error } = await supabase
                .from('profiles')
                .update(profileData) // The data to update
                .eq('id', user.id);    // WHERE id = user.id

            if (error) {
                // If there's an error, it will be thrown and caught here.
                throw error;
            }

            setStatusMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            console.error('Error updating profile:', error);
            setStatusMessage({ type: 'error', text: `Error: ${error.message}` });
        } finally {
            setIsUpdating(false);
        }
    };

    // Handle password update/setup
    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!newPassword) {
            setPasswordMessage({ type: 'error', text: 'Please enter a new password' });
            return;
        }

        const passwordErrors = validatePassword(newPassword);
        if (passwordErrors.length > 0) {
            setPasswordMessage({ type: 'error', text: passwordErrors[0] });
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        setPasswordUpdating(true);
        setPasswordMessage({ type: '', text: '' });

        try {
            // For users who might not have a password (Magic Link users), we can skip current password
            // For users with existing passwords, they should provide current password for security
            const { error } = await supabase.auth.updateUser({
                password: newPassword.trim()
            });

            if (error) {
                if (error.message.includes('same as the old password')) {
                    setPasswordMessage({ type: 'error', text: 'New password must be different from your current password' });
                } else {
                    setPasswordMessage({ type: 'error', text: error.message });
                }
            } else {
                setPasswordMessage({ 
                    type: 'success', 
                    text: hasPassword === false ? 'Password set successfully!' : 'Password updated successfully!' 
                });
                
                // Clear form
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setHasPassword(true);
                
                // Auto-hide success message after 3 seconds
                setTimeout(() => {
                    setPasswordMessage({ type: '', text: '' });
                }, 3000);
            }
        } catch (error) {
            console.error('Password update error:', error);
            setPasswordMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' });
        } finally {
            setPasswordUpdating(false);
        }
    };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return <div className="page-loading-message">Loading Account...</div>;
  }

  return (
    <div className="account-page-wrapper">
      <motion.div
        className="container"
        variants={staggerContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemFadeInUpVariants} className="account-header">
          <h1>Account Settings</h1>
          <p>Manage your profile information and session.</p>
        </motion.div>

        <motion.div variants={itemFadeInUpVariants} className="account-card">
          <div className="card-header">
            <IconUser />
            <h3>Your Profile</h3>
          </div>
          <form onSubmit={handleUpdateProfile} className="account-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input id="email" type="text" value={user?.email} disabled title="Email cannot be changed." />
            </div>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g., Shahmir Ahmed" />
            </div>
            <div className="form-group">
              <label htmlFor="website">Website URL</label>
              <input id="website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://your-portfolio.com" />
            </div>
            <div className="form-actions">
                <AnimatePresence>
                    {statusMessage.text && (
                        <motion.span 
                            className={`form-status-inline ${statusMessage.type}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                        >
                            {statusMessage.text}
                        </motion.span>
                    )}
                </AnimatePresence>
              <motion.button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isUpdating}
                variants={buttonHoverTapVariants}
                whileHover="hover"
                whileTap="tap"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </div>
          </form>
        </motion.div>

        <motion.div variants={itemFadeInUpVariants} className="account-card">
          <div className="card-header">
            <IconLock />
            <h3>Password Management</h3>
          </div>
          <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {hasPassword === false ? (
              <p style={{ margin: 0 }}>
                <strong>No password set:</strong> You signed in with Magic Link. Set a password below to enable traditional login.
              </p>
            ) : (
              <p style={{ margin: 0 }}>
                <strong>Password Security:</strong> Update your password regularly to keep your account secure.
              </p>
            )}
          </div>
          
          <form onSubmit={handlePasswordUpdate} className="account-form">
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="newPassword"
                  type={showPasswords ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  disabled={passwordUpdating}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
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
                >
                  {showPasswords ? '👁️‍🗨️' : '👁️'}
                </button>
              </div>
              {newPassword && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ 
                    height: '4px', 
                    backgroundColor: '#e5e7eb', 
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.max(20, (5 - validatePassword(newPassword).length) * 25)}%`,
                      backgroundColor: getPasswordStrength(newPassword).color,
                      transition: 'all 0.3s ease'
                    }}></div>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                    Password strength: {getPasswordStrength(newPassword).strength}
                  </span>
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                type={showPasswords ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                disabled={passwordUpdating}
              />
            </div>

            <div style={{ 
              marginBottom: '1rem', 
              padding: '0.75rem', 
              backgroundColor: 'var(--bg-primary)', 
              borderRadius: '6px',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)'
            }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '0.9rem' }}>Password Requirements:</h4>
              <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                <li>At least 8 characters long</li>
                <li>Contains uppercase and lowercase letters</li>
                <li>Contains at least one number</li>
                <li>Contains at least one special character (@$!%*?&)</li>
              </ul>
            </div>

            <div className="form-actions">
              <AnimatePresence>
                {passwordMessage.text && (
                  <motion.span 
                    className={`form-status-inline ${passwordMessage.type}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    {passwordMessage.text}
                  </motion.span>
                )}
              </AnimatePresence>
              <motion.button 
                type="submit" 
                className="btn btn-primary" 
                disabled={passwordUpdating}
                variants={buttonHoverTapVariants}
                whileHover="hover"
                whileTap="tap"
              >
                {passwordUpdating ? 'Updating...' : (hasPassword === false ? 'Set Password' : 'Update Password')}
              </motion.button>
            </div>
          </form>
        </motion.div>
        
        <motion.div variants={itemFadeInUpVariants} className="account-card danger-zone">
            <div className="card-header">
                <IconLogOut />
                <h3>Session Management</h3>
            </div>
            <div className="danger-zone-content">
                <p>Logging out will end your current session on this device.</p>
                <motion.button 
                    onClick={handleSignOut} 
                    className="btn btn-secondary" 
                    disabled={isUpdating}
                    variants={buttonHoverTapVariants}
                    whileHover="hover"
                    whileTap="tap"
                >
                    Sign Out
                </motion.button>
            </div>
        </motion.div>

      </motion.div>
    </div>
  );
}

export default AccountPage;