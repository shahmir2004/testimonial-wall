// src/pages/ContactPage.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { staggerContainerVariants, itemFadeInUpVariants, buttonHoverTapVariants } from '../utils/animationVariants';
import './ContactPage.css'; // We will create this

function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState({ submitting: false, message: '', type: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ submitting: true, message: 'Sending...', type: 'info' });

    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/contact`;
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "An unknown error occurred.");
      setStatus({ submitting: false, message: result.message, type: 'success' });
      setFormData({ name: '', email: '', subject: '', message: '' }); // Clear form on success
    } catch (error) {
      setStatus({ submitting: false, message: error.message, type: 'error' });
    }
  };

  return (
    <div className="contact-page-wrapper">
      <motion.div
        className="container"
        variants={staggerContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.header variants={itemFadeInUpVariants} className="contact-header">
          <h1>Get in Touch</h1>
          <p>Have a question, feedback, or a partnership idea? I'd love to hear from you!</p>
        </motion.header>

        <motion.div variants={itemFadeInUpVariants} className="contact-form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group"><label htmlFor="name">Full Name</label><input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required /></div>
              <div className="form-group"><label htmlFor="email">Email Address</label><input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required /></div>
            </div>
            <div className="form-group"><label htmlFor="subject">Subject</label><input id="subject" name="subject" type="text" value={formData.subject} onChange={handleChange} required /></div>
            <div className="form-group"><label htmlFor="message">Message</label><textarea id="message" name="message" rows="6" value={formData.message} onChange={handleChange} required /></div>
            
            {status.message && <div className={`form-status ${status.type}`}>{status.message}</div>}

            <motion.button type="submit" className="btn btn-primary" disabled={status.submitting} variants={buttonHoverTapVariants} whileHover="hover" whileTap="tap">
              {status.submitting ? 'Sending...' : 'Send Message'}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default ContactPage;