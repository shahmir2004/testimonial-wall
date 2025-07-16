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
const IconLogOut = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;

function AccountPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [website, setWebsite] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

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
    } catch (error) {
      console.error('Error fetching profile:', error);
      showStatusMessage('Error: Could not load your profile data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user]); // Dependency is the user object

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