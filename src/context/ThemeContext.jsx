// src/context/ThemeContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';

// 1. Create the Context
const ThemeContext = createContext();

// 2. Create a custom hook for easy access to the context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// 3. Create the Provider Component
export const ThemeProvider = ({ children }) => {
  // State to hold the current theme. We initialize it by checking localStorage first.
  const [theme, setTheme] = useState(() => {
    try {
      const storedTheme = localStorage.getItem('testimonial-wall-theme');
      // If a theme is stored, use it. Otherwise, default to 'light'.
      if (storedTheme) {
        return storedTheme;
      }

      // Optional: Check user's system preference as a default
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
      
      return 'light'; // Default to light theme
    } catch (error) {
      // If localStorage is not available (e.g., in some server environments or private browsing modes)
      console.error("Could not access localStorage to get theme.", error);
      return 'light';
    }
  });

  // Effect to apply the theme class to the <body> and save it to localStorage
  useEffect(() => {
    // Get the body element
    const body = window.document.body;

    // Clean up any existing theme classes
    body.classList.remove('light-mode', 'dark-mode');

    // Add the current theme class
    body.classList.add(`${theme}-mode`);

    // Save the current theme to localStorage for persistence
    try {
      localStorage.setItem('testimonial-wall-theme', theme);
    } catch (error) {
      console.error("Could not save theme to localStorage.", error);
    }
  }, [theme]); // This effect runs whenever the `theme` state changes

  // Function to toggle the theme between 'light' and 'dark'
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // The value that will be provided to all consuming components
  const value = {
    theme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};