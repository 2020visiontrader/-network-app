// sdk53-generate-qr.js
// Updated script to start Expo SDK 53 and generate a QR code for testing on device
const qrcode = require('qrcode-terminal');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { networkInterfaces } = require('os');

// Get local IP address
function getLocalIpAddress() {
  const interfaces = networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if ('IPv4' !== iface.family || iface.internal !== false) {
        continue;
      }
      return iface.address;
    }
  }
  return '127.0.0.1';
}

// Path to the SDK 53 project
const sdk53Path = path.resolve(__dirname, '../NetworkFounderApp53');

// Get local IP and configure port
const localIp = getLocalIpAddress();
const port = 8081; // Default Expo port
const expoUrl = `exp://${localIp}:${port}`;

console.log('=== NetworkFounderApp SDK 53 QR Code Generator ===');
console.log(`\nScan this QR code with the Expo Go app on your device:`);
qrcode.generate(expoUrl);

console.log(`\nOr use this URL in Expo Go: ${expoUrl}`);
console.log('\nMake sure your device is on the same WiFi network as this computer.');
console.log('\nIMPORTANT: This QR code is for the SDK 53 version of the app.');

// Save the URL to a file for easy access
const urlFilePath = path.join(__dirname, 'expo-sdk53-url.txt');
fs.writeFileSync(urlFilePath, expoUrl);
console.log(`\nURL saved to: ${urlFilePath}`);

// Instructions for manually starting the app
console.log('\n=== To start the SDK 53 app manually: ===');
console.log('1. Navigate to the SDK 53 project directory:');
console.log(`   cd "${sdk53Path}"`);
console.log('2. Start the Expo development server:');
console.log('   npx expo start');
console.log('\nThen scan the QR code that appears in your terminal.');
