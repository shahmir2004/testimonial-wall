// src/pages/AccountPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function AccountPage() {
  const { user, signOut } = useAuth(); // Get user and signOut function from context
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(''); // We'll just display this for now
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Fetch the user's profile data when the component loads
  useEffect(() => {
    const getProfile = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const { data, error, status } = await supabase
          .from('profiles')
          .select(`username, website_url, avatar_url`)
          .eq('id', user.id)
          .single(); // .single() expects exactly one row, which is correct here

        if (error && status !== 406) {
          throw error;
        }

        if (data) {
          setUsername(data.username || '');
          setWebsite(data.website_url || '');
          setAvatarUrl(data.avatar_url || '');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setStatusMessage({ type: 'error', text: 'Error fetching profile data.' });
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [user]); // Rerun if the user object changes

  // Handle profile updates
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setStatusMessage({ type: 'info', text: 'Updating...' });

    const updates = {
      // id: user.id,
      username,
      website_url: website,
      updated_at: new Date(),
    };
     // --- DEBUGGING ---
  console.log("Current User ID:", user.id);
  console.log("Data being sent to upsert:", updates);
  // --- END DEBUGGING ---
    try {
      const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id); // Specify which row to update with .eq()
      if (error) {
        throw error;
      }
      setStatusMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setStatusMessage({ type: 'error', text: 'Error updating profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/'); // Redirect to homepage after sign out
  };


  if (loading) {
    return <p>Loading account information...</p>;
  }

  return (
    <div>
      <h2>Account Settings</h2>
      <div style={{ margin: '2rem auto', padding: '1.5rem', border: '1px solid #444', borderRadius: '8px', maxWidth: '500px' }}>
        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="email" style={{display:'block', marginBottom:'0.5rem'}}>Email</label>
            <input id="email" type="text" value={user?.email} disabled />
          </div>
          <div>
            <label htmlFor="username" style={{display:'block', marginBottom:'0.5rem'}}>Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="website" style={{display:'block', marginBottom:'0.5rem'}}>Website URL</label>
            <input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>
          
          {/* Display status messages */}
          {statusMessage.text && (
            <p style={{ 
                color: statusMessage.type === 'success' ? 'green' : statusMessage.type === 'error' ? 'red' : 'white'
            }}>
                {statusMessage.text}
            </p>
          )}

          <div>
            <button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>

      <div style={{marginTop: '2rem'}}>
        <button onClick={handleSignOut} disabled={loading} style={{backgroundColor: '#555'}}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default AccountPage;