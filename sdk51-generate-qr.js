// sdk51-generate-qr.js
// Script to generate a QR code for Expo SDK 51
const qrcode = require('qrcode-terminal');
const { networkInterfaces } = require('os');
const fs = require('fs');

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

// Path to the SDK 51 project (current directory)
const sdk51Path = __dirname;

// Get local IP and configure port
const localIp = getLocalIpAddress();
const port = 8081; // Default Expo port
const expoUrl = `exp://${localIp}:${port}`;

console.log('=== NetworkFounderApp SDK 51 QR Code Generator ===');
console.log(`\nScan this QR code with the Expo Go app on your device:`);
qrcode.generate(expoUrl);

console.log(`\nOr use this URL in Expo Go: ${expoUrl}`);
console.log('\nMake sure your device is on the same WiFi network as this computer.');
console.log('\nIMPORTANT: This QR code is for the SDK 51 version of the app.');

// Save the URL to a file for easy access
const urlFilePath = 'expo-sdk51-url.txt';
fs.writeFileSync(urlFilePath, expoUrl);
console.log(`\nURL saved to: ${urlFilePath}`);

// Create HTML file with QR code
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NetworkFounderApp SDK 51 QR Code</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
        }
        h1 {
            color: #333;
        }
        .qr-container {
            margin: 30px 0;
        }
        .url {
            background-color: #f4f4f4;
            padding: 10px;
            border-radius: 5px;
            margin: 20px 0;
            font-family: monospace;
        }
        .instructions {
            text-align: left;
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 5px;
        }
        .warning {
            color: #d84315;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <h1>NetworkFounderApp SDK 51 QR Code</h1>
    
    <div class="qr-container">
        <!-- QR Code for SDK 51 App -->
        <img src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(expoUrl)}&size=300x300" alt="QR Code for SDK 51 App">
    </div>
    
    <div class="url">
        <strong>Expo URL:</strong> ${expoUrl}
    </div>
    
    <div class="instructions">
        <h2>Instructions:</h2>
        <ol>
            <li>Open the <strong>Expo Go</strong> app on your mobile device</li>
            <li>Scan the QR code above or enter the URL manually</li>
            <li>Make sure your device is on the <span class="warning">same WiFi network</span> as your computer</li>
            <li>Wait for the app to load and build on your device</li>
        </ol>
        
        <h3>If the QR code doesn't work:</h3>
        <ol>
            <li>Verify that the Expo development server is running</li>
            <li>Check that your computer and mobile device are on the same network</li>
            <li>Try entering the URL manually in the Expo Go app</li>
            <li>Restart the Expo development server and try again</li>
        </ol>
    </div>
    
    <p class="warning">Note: This QR code is for the SDK 51 version of the app.</p>
    
    <footer>
        <p>Generated on: ${new Date().toLocaleString()}</p>
    </footer>
</body>
</html>`;

fs.writeFileSync('expo-sdk51-qr-code.html', htmlContent);
console.log(`\nHTML QR code page saved to: expo-sdk51-qr-code.html`);

// Instructions for manually starting the app
console.log('\n=== To start the SDK 51 app manually: ===');
console.log('1. Make sure you are in the SDK 51 project directory:');
console.log(`   cd "${sdk51Path}"`);
console.log('2. Start the Expo development server:');
console.log('   npx expo start');
console.log('\nThen scan the QR code that appears in your terminal.');
