// src/components/PasswordResetGuard.jsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PasswordResetGuard = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if there's a password reset token in the URL
    const hasResetToken = window.location.hash.includes('access_token') && 
                         window.location.hash.includes('type=recovery');
    
    // If user has a reset token but is not on the update password page, redirect them
    if (hasResetToken && location.pathname !== '/update-password') {
      navigate('/update-password', { replace: true });
    }
  }, [navigate, location.pathname]);

  return children;
};

export default PasswordResetGuard;
