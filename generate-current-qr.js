// generate-current-qr.js
// Script to generate a QR code for the current project
const qrcode = require('qrcode-terminal');
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

// Get package.json to determine SDK version
let sdkVersion = 'unknown';
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (packageJson.dependencies && packageJson.dependencies.expo) {
    sdkVersion = packageJson.dependencies.expo.replace(/[^0-9.]/g, '');
  }
} catch (error) {
  console.error('Error reading package.json:', error.message);
}

// Get local IP and configure port
const localIp = getLocalIpAddress();
const port = 8081; // Default Expo port
const expoUrl = `exp://${localIp}:${port}`;

console.log(`=== NetworkFounderApp QR Code Generator (SDK ${sdkVersion}) ===`);
console.log(`\nScan this QR code with the Expo Go app on your device:`);
qrcode.generate(expoUrl);

console.log(`\nOr use this URL in Expo Go: ${expoUrl}`);
console.log('\nMake sure your device is on the same WiFi network as this computer.');
console.log(`\nThis QR code is for Expo SDK ${sdkVersion}`);

// Save the URL to a file for easy access
const urlFilePath = `expo-sdk${sdkVersion}-url.txt`;
fs.writeFileSync(urlFilePath, expoUrl);
console.log(`\nURL saved to: ${urlFilePath}`);

console.log('\n=== To start the app manually: ===');
console.log('1. Start the Expo development server:');
console.log('   npx expo start');
console.log('\nThen scan the QR code that appears in your terminal.');
