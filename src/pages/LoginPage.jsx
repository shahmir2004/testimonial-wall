// src/pages/LoginPage.jsx
import React, { useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();

  // Check if a user is already logged in and redirect them to the dashboard
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      }
    };
    checkSession();
  }, [navigate]);

  // Listen for authentication events (like successful login)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        // Redirect to dashboard on successful sign-in
        navigate('/dashboard');
      }
    });

    // Cleanup subscription on component unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div style={{ maxWidth: '420px', margin: '50px auto' }}>
      <h2>Welcome to Testimonial Wall</h2>
      <p>Sign in or create an account to start managing your testimonials.</p>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }} // Pre-styled theme
        theme="dark" // Or "light" depending on your default theme
        providers={['google', 'github']} // Optional: Add social logins
        redirectTo={window.location.origin + '/dashboard'} // Redirect after social login email confirmation
      />
    </div>
  );
}

export default LoginPage;