// show-expo-qr.js
// This script generates a QR code for the Expo app and shows it in a browser window

const qrcode = require('qrcode');
const fs = require('fs');
const { exec } = require('child_process');
const os = require('os');
const path = require('path');

// Get the local IP address for the QR code
function getLocalIpAddress() {
  const nets = os.networkInterfaces();
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  
  return '192.168.0.1'; // Fallback IP if we can't detect it
}

// Generate the QR code as an HTML file
async function generateQRCode() {
  const ip = getLocalIpAddress();
  const expoUrl = `exp://${ip}:8081`;
  
  console.log(`\nGenerating QR code for: ${expoUrl}`);
  console.log('Make sure your device is on the same WiFi network as this computer.\n');
  
  // Generate QR code as a data URL
  const qrDataURL = await qrcode.toDataURL(expoUrl, {
    width: 400,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  });
  
  // Create HTML file with the QR code
  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Expo QR Code</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        text-align: center;
      }
      h1 {
        color: #2d3748;
      }
      .qr-container {
        margin: 30px auto;
      }
      .url {
        margin-top: 20px;
        padding: 10px;
        background-color: #f7fafc;
        border-radius: 5px;
        font-family: monospace;
        word-break: break-all;
      }
      .instructions {
        margin-top: 30px;
        text-align: left;
        background-color: #f7fafc;
        padding: 15px;
        border-radius: 5px;
      }
      .instructions li {
        margin-bottom: 10px;
      }
    </style>
  </head>
  <body>
    <h1>Expo QR Code for Network App</h1>
    <div class="qr-container">
      <img src="${qrDataURL}" alt="Expo QR Code" width="300">
    </div>
    <div class="url">
      <strong>URL:</strong> ${expoUrl}
    </div>
    <div class="instructions">
      <h3>How to use:</h3>
      <ol>
        <li>Open the <strong>Expo Go</strong> app on your device</li>
        <li>Tap on <strong>"Scan QR Code"</strong></li>
        <li>Scan this QR code with your device's camera</li>
        <li>The app should load on your device</li>
      </ol>
      <p><strong>Note:</strong> Make sure your device is on the same WiFi network as this computer.</p>
    </div>
  </body>
  </html>
  `;
  
  // Write HTML file
  const htmlPath = path.join(__dirname, 'expo-qr-code.html');
  fs.writeFileSync(htmlPath, htmlContent);
  
  // Generate a text file with the URL for easy copy-paste
  const txtPath = path.join(__dirname, 'expo-url.txt');
  fs.writeFileSync(txtPath, expoUrl);
  
  console.log(`QR code saved to: ${htmlPath}`);
  console.log(`URL saved to: ${txtPath}`);
  
  // Open the HTML file in the default browser
  try {
    const command = process.platform === 'win32' ? 'start' : 
                  process.platform === 'darwin' ? 'open' : 'xdg-open';
    exec(`${command} "${htmlPath}"`);
    console.log('QR code opened in your browser');
  } catch (error) {
    console.error('Could not open browser automatically. Please open the HTML file manually.');
  }
  
  // Print the URL in the terminal for easy copy-paste
  console.log('\n=======================');
  console.log('EXPO URL (copy this to your device if QR code doesn\'t work):');
  console.log(expoUrl);
  console.log('=======================\n');
}

// Execute
generateQRCode().catch(err => {
  console.error('Error generating QR code:', err);
});
