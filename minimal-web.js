// minimal-web.js
// A minimal web version of the app
import React from 'react';
import { createRoot } from 'react-dom/client';
import { View, Text, StyleSheet } from 'react-native-web';

// Minimal app component
function MinimalApp() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Network Founder App</Text>
      <Text style={styles.subtitle}>Web Version (Minimal)</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.info}>
          This is the minimal web version of NetworkFounderApp.
        </Text>
        <Text style={styles.info}>
          The full experience is available on iOS and Android.
        </Text>
      </View>
      <Text style={styles.buttonText} onPress={() => alert('Web version works!')}>
        Test Connection
      </Text>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    height: '100vh',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#7d58ff',
    marginBottom: 30,
  },
  infoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 10,
    maxWidth: 500,
    marginBottom: 30,
  },
  info: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  buttonText: {
    color: '#ffffff',
    backgroundColor: '#7d58ff',
    fontSize: 16,
    fontWeight: 'bold',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
});

// Initialize app
const rootElement = document.getElementById('root');
const root = createRoot(rootElement);
root.render(<MinimalApp />);
