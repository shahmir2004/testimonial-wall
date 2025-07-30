// src/pages/HomePage.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ParticleBackground from '../components/ParticleBackground.jsx';
import {
  staggerContainerVariants,
  itemFadeInUpVariants,
  buttonHoverTapVariants,
  sectionScrollRevealVariants,
} from '../utils/animationVariants';
import './HomePage.css';
import { useTheme } from '../context/ThemeContext';

// --- Icon Components (for a polished look) ---
const IconCollect = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>;
const IconMagic = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const IconEmbed = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>;

// This is the main page component
function HomePage() {
  const { theme } = useTheme();
   useEffect(() => {
    // Find the widget container div on the page
    const widgetContainer = document.getElementById('testimonial-wall-container');
    
    // If the container exists, set its data-theme attribute to match the global theme
    if (widgetContainer) {
      widgetContainer.setAttribute('data-theme', theme);
    }
  }, [theme]); // This effect will re-run ONLY when the global `theme` state changes

  
  return (
    <div className="homepage-wrapper">
      {/* Hero Section */}
      <section className="hero-section">
        <ParticleBackground />
          <div className="container hero-content-container">
            <motion.div
              variants={staggerContainerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.h1 variants={itemFadeInUpVariants} className="hero-title text-shadow-strong">
                Turn Your Best Feedback into Your Best Marketing.
              </motion.h1>
              <motion.p variants={itemFadeInUpVariants} className="hero-description">
                Effortlessly collect, manage, and showcase stunning testimonials on your website with AI-powered assistance. Build trust and win more customers.
              </motion.p>
              <motion.div variants={itemFadeInUpVariants}>
                <Link to="/login">
                  <motion.button
                    className="btn btn-primary hero-cta"
                    variants={buttonHoverTapVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    Start for Free & Build Your Wall
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

      {/* "How It Works" Section */}
      <motion.section
        className="how-it-works-section section-wrapper"
        variants={sectionScrollRevealVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="container text-center">
          <h2 className="section-title">It's as easy as 1, 2, 3.</h2>
          <p className="section-subtitle">Go from scattered feedback to a beautiful "Wall of Love" in minutes.</p>
          <div className="steps-grid">
            <motion.div variants={itemFadeInUpVariants} className="step-card">
              <div className="step-icon-wrapper"><IconCollect /></div>
              <h3>1. Collect</h3>
              <p>Easily add testimonials manually, or let our AI import them directly from your emails.</p>
            </motion.div>
            <motion.div variants={itemFadeInUpVariants} className="step-card">
              <div className="step-icon-wrapper"><IconMagic /></div>
              <h3>2. Enhance with AI</h3>
              <p>Automatically summarize long reviews and highlight the most impactful phrases.</p>
            </motion.div>
            <motion.div variants={itemFadeInUpVariants} className="step-card">
              <div className="step-icon-wrapper"><IconEmbed /></div>
              <h3>3. Display</h3>
              <p>Copy one line of code to embed a beautiful, responsive testimonial wall on your site.</p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Live Demo Section */}
      <section className="live-demo-section section-wrapper page-section-themed">
        <div className="container text-center">
          <h2 className="section-title">See It in Action</h2>
          <p className="section-subtitle">This is a live, embeddable widget just like the one you can add to your own site. Interact with it!</p>
          <div className="live-demo-container">
            {/* THIS IS THE LIVE WIDGET EMBED */}
            <div id="testimonial-wall-container" data-user-id="f1101176-aa79-4fd3-8bc9-b860cee60c15" data-theme={theme}></div>
            {/* data-theme can be "light" or "dark" based on your preference for the demo */}
          </div>
        </div>
      </section>

      {/* Final Call To Action Section */}
      <motion.section
        className="final-cta-section section-wrapper"
        variants={sectionScrollRevealVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="container text-center">
          <h2 className="section-title">Ready to Showcase Your Social Proof?</h2>
          <p className="section-subtitle">
            Stop letting your best customer feedback get lost in your inbox. Start building your "Wall of Love" today. No credit card required.
          </p>
          <motion.div variants={itemFadeInUpVariants}>
            <Link to="/login">
              <motion.button
                className="btn btn-primary final-cta-btn"
                variants={buttonHoverTapVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Sign Up - It's Free
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}


// --- This wrapper component handles loading the widget script ---
// Custom hook to dynamically load a script
const useScript = (url) => {
    useEffect(() => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      return () => { // Cleanup function to remove the script when component unmounts
        document.body.removeChild(script);
      }
    }, [url]); // Only re-run if the URL changes
};

// We wrap the HomePage to use the hook, ensuring the script is loaded when this page is active
const HomePageWithWidget = () => {
    // This loads your public widget script for the demo section
    useScript('/testimonial-widget.js');
    return <HomePage />;
}

export default HomePageWithWidget; // Export the wrapped component