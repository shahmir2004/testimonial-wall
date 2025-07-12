// src/pages/LoginPage.jsx
import React, { useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

function LoginPage() {
  const { session } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if a session already exists
  useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);

  // Listener for successful sign-in events (e.g., after email confirmation)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          navigate('/dashboard');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="login-page-container">
      <div className="login-card">
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Sign in or create an account to manage your Wall of Love.</p>
        <div className="auth-form-wrapper">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'var(--brand-primary)',
                    brandAccent: 'hsl(221, 83%, 60%)',
                    defaultButtonBackgroundHover: 'hsl(221, 83%, 60%)',
                    inputText: 'var(--text-primary)',
                    inputLabelText: 'var(--text-secondary)',
                    inputBorder: 'var(--border-primary)',
                    inputBackground: 'var(--bg-primary)',
                  },
                  fonts: {
                    bodyFontFamily: 'var(--font-primary)',
                    buttonFontFamily: 'var(--font-primary)',
                    labelFontFamily: 'var(--font-primary)',
                  }
                },
              },
            }}
            theme="dark" // Base Supabase UI theme
            providers={[]} // <-- THIS IS THE ONLY CHANGE NEEDED
            // redirectTo is still useful for password reset flows
            redirectTo={`${window.location.origin}/dashboard`} 
          />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;