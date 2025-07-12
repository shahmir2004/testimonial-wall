// src/components/ThemeToggleButton.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext'; // Ensure this path is correct
import './ThemeToggleButton.css';

// Simple but effective SVG icons for Sun and Moon
const SunIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const MoonIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const iconVariants = {
    hidden: { y: -20, opacity: 0, scale: 0.5, rotate: -90 },
    visible: { y: 0, opacity: 1, scale: 1, rotate: 0 },
    exit: { y: 20, opacity: 0, scale: 0.5, rotate: 90 }
};

function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();

  // Return null or a placeholder if the theme context is not yet available, prevents errors on first render
  if (!theme) return null;

  return (
    <motion.button
      onClick={toggleTheme}
      className="theme-toggle-button"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      whileHover={{ scale: 1.1, rotate: 15 }}
      whileTap={{ scale: 0.9, rotate: -15 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
            key={theme} // The key changing is what triggers the exit/enter animation
            variants={iconVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}

export default ThemeToggleButton;