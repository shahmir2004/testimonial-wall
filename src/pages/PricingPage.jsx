// src/pages/PricingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { staggerContainerVariants, itemFadeInUpVariants, buttonHoverTapVariants } from '../utils/animationVariants';
import './PricingPage.css'; // We will create this CSS file

// Simple Checkmark Icon Component
const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="feature-check-icon">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

function PricingPage() {
  return (
    <div className="pricing-page-wrapper">
      <motion.div
        className="container pricing-container"
        variants={staggerContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* --- Header --- */}
        <motion.header variants={itemFadeInUpVariants} className="pricing-header">
          <h1>Find the Perfect Plan</h1>
          <p>Start for free and scale as you grow. No credit card required to begin.</p>
        </motion.header>

        {/* --- Pricing Cards Grid --- */}
        <div className="pricing-grid">
          
          {/* Free Tier Card */}
          <motion.div variants={itemFadeInUpVariants} className="pricing-card">
            <div className="card-header">
              <h3>Free</h3>
              <p className="price">
                $0<span className="price-term">/ month</span>
              </p>
              <p className="card-description">For individuals and hobbyists getting started with testimonials.</p>
            </div>
            <div className="card-features">
              <h4>What's included:</h4>
              <ul>
                <li><CheckIcon /> <strong>10</strong> Testimonials</li>
                <li><CheckIcon /> <strong>1</strong> Embeddable "Wall of Love"</li>
                <li><CheckIcon /> Widget Customization (Theme & Color)</li>
                <li><CheckIcon /> Testimonial Request Links</li>
                <li><CheckIcon /> "Powered by" Branding on Widget</li>
              </ul>
            </div>
            <div className="card-cta">
                <Link to="/login">
                    <motion.button
                        className="btn btn-secondary"
                        variants={buttonHoverTapVariants}
                        whileHover="hover"
                        whileTap="tap"
                    >
                        Get Started
                    </motion.button>
                </Link>
            </div>
          </motion.div>

          {/* Pro Tier Card (Highlighted) */}
          <motion.div variants={itemFadeInUpVariants} className="pricing-card featured">
            <div className="featured-badge">Most Popular</div>
            <div className="card-header">
              <h3>Pro</h3>
              <p className="price">
                $9<span className="price-term">/ month</span>
              </p>
              <p className="card-description">For professionals and businesses who want to automate and supercharge their social proof.</p>
            </div>
            <div className="card-features">
              <h4>Everything in Free, plus:</h4>
              <ul>
                <li><CheckIcon /> <strong>Unlimited</strong> Testimonials</li>
                <li><CheckIcon /> <strong>Multiple</strong> Embeddable Walls</li>
                <li><CheckIcon /> ✨ <strong>AI-Powered Summarization</strong></li>
                <li><CheckIcon /> ✨ <strong>AI Email Ingestion</strong> (Coming Soon)</li>
                <li><CheckIcon /> Remove "Powered by" Branding</li>
                <li><CheckIcon /> Priority Support</li>
              </ul>
            </div>
            <div className="card-cta">
                {/* This will link to your Stripe/Lemon Squeezy checkout page later */}
                <Link to="/login">
                    <motion.button
                        className="btn btn-primary"
                        variants={buttonHoverTapVariants}
                        whileHover="hover"
                        whileTap="tap"
                    >
                        Go Pro
                    </motion.button>
                </Link>
            </div>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}

export default PricingPage;