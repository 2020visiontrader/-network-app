// app-standalone.js - This will be bundled into app-bundle.js
import React from 'react';
import { createRoot } from 'react-dom/client';

// Simple standalone app for web
function NetworkFounderApp() {
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      height: '100%',
      width: '100%',
      backgroundColor: '#1f2937',
      color: 'white',
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: '10px',
    },
    subtitle: {
      fontSize: '18px',
      color: '#7d58ff',
      marginBottom: '30px',
    },
    infoContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      padding: '20px',
      borderRadius: '10px',
      maxWidth: '500px',
      marginBottom: '30px',
    },
    info: {
      fontSize: '16px',
      color: '#ffffff',
      marginBottom: '10px',
      textAlign: 'center',
    },
    button: {
      backgroundColor: '#7d58ff',
      padding: '12px 24px',
      borderRadius: '8px',
      marginTop: '20px',
      cursor: 'pointer',
    },
    buttonText: {
      color: '#ffffff',
      fontSize: '16px',
      fontWeight: 'bold',
    }
  };

  const handleTestConnection = () => {
    alert('Web version is working!');
    console.log('Button clicked: Web version is working!');
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Network Founder App</h1>
      <h2 style={styles.subtitle}>Web Version</h2>
      
      <div style={styles.infoContainer}>
        <p style={styles.info}>
          This is the web version of the NetworkFounderApp.
        </p>
        <p style={styles.info}>
          The full mobile experience is available on iOS and Android.
        </p>
      </div>
      
      <button 
        style={styles.button}
        onClick={handleTestConnection}
      >
        <span style={styles.buttonText}>Test Connection</span>
      </button>
    </div>
  );
}

// Wait for the DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Find the root element
  const rootElement = document.getElementById('root');
  
  // Clear any loading spinner or content
  if (rootElement) {
    rootElement.innerHTML = '';
  }
  
  // Create root and render
  const root = createRoot(rootElement);
  root.render(<NetworkFounderApp />);
  
  console.log('NetworkFounderApp web version loaded successfully!');
});
