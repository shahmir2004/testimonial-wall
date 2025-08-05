// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
    };
    getSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Detect Magic Link sign-in more accurately
      if (event === 'SIGNED_IN' && session?.user) {
        // Check if this is a Magic Link sign-in by looking at URL parameters specifically
        const urlParams = new URLSearchParams(window.location.search);
        const isMagicLink = urlParams.get('magic_link') === 'true' || 
                           window.location.hash.includes('type=magiclink');
        
        if (isMagicLink) {
          localStorage.setItem('magic_link_signin', 'true');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    signUp: (data) => supabase.auth.signUp(data),
    signIn: (data) => supabase.auth.signInWithPassword(data),
    signOut: () => supabase.auth.signOut(),
    user,
    session,
  };

  // We only render children once the initial session has been checked
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};