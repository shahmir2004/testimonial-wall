// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // We will use a simple global stylesheet
import { ThemeProvider } from './context/ThemeContext.jsx';
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider> {/* Wrap your entire App component */}
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);