// App.web.js - Web-specific version of the App component
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// This is a simplified version of the App for web to get it working
export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Network Founder App</Text>
      <Text style={styles.subtitle}>Web Version (SDK 51)</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.info}>
          This is the web version of the NetworkFounderApp.
        </Text>
        <Text style={styles.info}>
          The full mobile experience is available on iOS and Android.
        </Text>
      </View>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => console.log("Web version is working!")}
      >
        <Text style={styles.buttonText}>Test Connection</Text>
      </TouchableOpacity>
      
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
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
  button: {
    backgroundColor: '#7d58ff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
