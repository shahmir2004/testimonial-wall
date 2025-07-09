// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div>
      <h1>Testimonial Wall</h1>
      <h2>Collect, Manage, and Showcase Your Best Testimonials with AI.</h2>
      <p>This is the marketing landing page for your SaaS application.</p>
      <p>It will explain the features, show pricing, and encourage users to sign up.</p>
      <br />
      <Link to="/dashboard">
        <button>Go to Dashboard</button>
      </Link>
    </div>
  );
}

export default HomePage;