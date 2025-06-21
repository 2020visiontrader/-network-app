// index.web.js
// This is the entry point for the web version of the app

import { registerRootComponent } from 'expo';
import { createElement } from 'react';
import { AppRegistry } from 'react-native';

// Import the web-specific App component
import App from './App.web';

// Register the app component
AppRegistry.registerComponent('main', () => App);

// Web-specific setup
if (typeof document !== 'undefined') {
  const rootTag = document.getElementById('root');
  
  // Clear any loading indicator
  if (rootTag) {
    while (rootTag.firstChild) {
      rootTag.removeChild(rootTag.firstChild);
    }
  }

  // Run the application
  AppRegistry.runApplication('main', {
    rootTag,
    initialProps: {},
  });
}
