// src/pages/AccountPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { itemFadeInUpVariants, staggerContainerVariants } from '../utils/animationVariants'; // Import shared variants
import './AccountPage.css'; // New styles for this page

// Simple SVG Icons
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

  useEffect(() => {
    const getProfile = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`username, website_url`)
          .eq('id', user.id)
          .single();
        if (error) throw error;
        if (data) {
          setUsername(data.username || '');
          setWebsite(data.website_url || '');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        showStatusMessage('Error fetching profile data.', 'error');
      } finally {
        setLoading(false);
      }
    };
    getProfile();
  }, [user]);

  const showStatusMessage = (text, type = 'info', duration = 4000) => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage({ text: '', type: '' }), duration);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!user) return;
    setIsUpdating(true);
    const updates = { id: user.id, username, website_url: website, updated_at: new Date() };
    try {
      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;
      showStatusMessage('Profile updated successfully!', 'success');
    } catch (error) {
      showStatusMessage(`Error: ${error.message}`, 'error');
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
    <div className="account-page-container">
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
                {statusMessage.text && (
                    <span className={`form-status-inline ${statusMessage.type}`}>
                        {statusMessage.text}
                    </span>
                )}
              <button type="submit" className="btn btn-primary" disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
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
                <button onClick={handleSignOut} className="btn btn-secondary" disabled={isUpdating}>
                    Sign Out
                </button>
            </div>
        </motion.div>

      </motion.div>
    </div>
  );
}

export default AccountPage;