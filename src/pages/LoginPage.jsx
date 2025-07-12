// src/pages/LoginPage.jsx
import React, { useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css'; // New CSS file for this page

function LoginPage() {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);

  return (
    <div className="login-page-container">
      <div className="login-card">
        <h2 className="login-title">Welcome to Testimonial Wall</h2>
        <p className="login-subtitle">Sign in or create an account to get started.</p>
        <div className="auth-form-wrapper">
          <Auth
            supabaseClient={supabase}
            appearance={{
                theme: ThemeSupa,
                // Override Supabase theme with our CSS variables
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
                            // ...and so on
                        },
                        fonts: {
                            bodyFontFamily: 'var(--font-primary)',
                            buttonFontFamily: 'var(--font-primary)',
                            labelFontFamily: 'var(--font-primary)',
                        }
                    },
                },
            }}
            theme="dark" // The base theme to style from, our variables override it
            providers={['google', 'github']}
            redirectTo={`${window.location.origin}/dashboard`}
          />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;