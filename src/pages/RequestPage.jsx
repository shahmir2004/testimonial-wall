// src/pages/RequestPage.jsx
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './LoginPage.css'; // << Reusing login page styles for the card

function RequestPage() {
  const { userId } = useParams(); // Get the target user ID from the URL
  const [formData, setFormData] = useState({ author_name: '', author_title: '', testimonial_text: '' });
  const [status, setStatus] = useState({ submitting: false, message: '', type: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ submitting: true, message: 'Submitting...', type: 'info' });
    
    // Get the API URL from our environment variables
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/testimonials/submit`;
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "An unknown error occurred.");
      setStatus({ submitting: false, message: 'Thank you! Your testimonial has been submitted successfully.', type: 'success' });
    } catch (error) {
      setStatus({ submitting: false, message: error.message, type: 'error' });
    }
  };

  // If submission is successful, show a thank you message
  if (status.type === 'success') {
    return (
      <div className="login-page-wrapper">
        <motion.div className="login-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="login-header">
            <h2>Thank You!</h2>
            <p>{status.message}</p>
            <Link to="/" className="btn btn-secondary" style={{marginTop: '1.5rem'}}>Back to Home</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="login-page-wrapper">
      <motion.div className="login-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="login-header">
          <h2>Provide a Testimonial</h2>
          <p>Your feedback is greatly appreciated and helps others make informed decisions.</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="author_name">Your Full Name</label>
            <input id="author_name" name="author_name" type="text" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="author_title">Your Title/Company (Optional)</label>
            <input id="author_title" name="author_title" type="text" onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="testimonial_text">Your Feedback</label>
            <textarea id="testimonial_text" name="testimonial_text" rows="6" onChange={handleChange} required />
          </div>
          <AnimatePresence>
            {status.message && (
              <motion.p className={`auth-message ${status.type}`} /* ... */ >{status.message}</motion.p>
            )}
          </AnimatePresence>
          <button type="submit" className="btn btn-primary" disabled={status.submitting}>
            {status.submitting ? 'Submitting...' : 'Submit Testimonial'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
export default RequestPage;