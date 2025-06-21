#!/bin/bash
# generate-qr-codes.sh - Generate QR codes for Expo app (SDK 51 and SDK 53)

set -e # Exit on error

echo "=== Generating QR Codes for NetworkFounderApp ==="

# Create directory for QR codes
mkdir -p qrcodes

# Get local IP address
IP_ADDRESS=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -n 1)

# Generate SDK 51 QR code
echo "Generating QR code for SDK 51..."
SDK51_URL="exp://$IP_ADDRESS:8081"
echo "SDK 51 URL: $SDK51_URL"

cat > qrcodes/sdk51-qr.html << EOL
<!DOCTYPE html>
<html>
<head>
  <title>NetworkFounderApp - SDK 51 QR Code</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      background-color: #1f2937;
      color: white;
      text-align: center;
    }
    .qr-container {
      margin: 20px;
      padding: 20px;
      background-color: white;
      border-radius: 10px;
    }
    h1 {
      color: #7d58ff;
    }
    p {
      margin: 10px 0;
      max-width: 500px;
    }
    .url {
      margin: 20px 0;
      padding: 10px;
      background-color: #374151;
      border-radius: 5px;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <h1>NetworkFounderApp - SDK 51</h1>
  <p>Scan this QR code with your Expo Go app to open the app on your device.</p>
  <div class="qr-container">
    <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=$SDK51_URL" alt="QR Code for SDK 51">
  </div>
  <p class="url">URL: $SDK51_URL</p>
  <p>Note: Your device must be connected to the same network as this computer.</p>
</body>
</html>
EOL

# Generate SDK 53 QR code
echo "Generating QR code for SDK 53..."
SDK53_URL="exp://$IP_ADDRESS:8082"
echo "SDK 53 URL: $SDK53_URL"

cat > qrcodes/sdk53-qr.html << EOL
<!DOCTYPE html>
<html>
<head>
  <title>NetworkFounderApp - SDK 53 QR Code</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      background-color: #1f2937;
      color: white;
      text-align: center;
    }
    .qr-container {
      margin: 20px;
      padding: 20px;
      background-color: white;
      border-radius: 10px;
    }
    h1 {
      color: #7d58ff;
    }
    p {
      margin: 10px 0;
      max-width: 500px;
    }
    .url {
      margin: 20px 0;
      padding: 10px;
      background-color: #374151;
      border-radius: 5px;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <h1>NetworkFounderApp - SDK 53</h1>
  <p>Scan this QR code with your Expo Go app to open the app on your device.</p>
  <div class="qr-container">
    <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=$SDK53_URL" alt="QR Code for SDK 53">
  </div>
  <p class="url">URL: $SDK53_URL</p>
  <p>Note: Your device must be connected to the same network as this computer.</p>
</body>
</html>
EOL

# Generate index file with links to both QR codes
cat > qrcodes/index.html << EOL
<!DOCTYPE html>
<html>
<head>
  <title>NetworkFounderApp - QR Codes</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background-color: #1f2937;
      color: white;
      text-align: center;
      padding: 20px;
    }
    h1 {
      color: #7d58ff;
    }
    .button-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin: 30px 0;
    }
    .button {
      display: inline-block;
      background-color: #7d58ff;
      color: white;
      text-decoration: none;
      padding: 15px 30px;
      border-radius: 8px;
      font-weight: bold;
      transition: background-color 0.3s;
    }
    .button:hover {
      background-color: #6747cc;
    }
    .info {
      margin: 20px 0;
      max-width: 600px;
      line-height: 1.5;
    }
    .sdk-info {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 20px;
      width: 100%;
      max-width: 600px;
    }
    .sdk-card {
      background-color: #374151;
      padding: 15px;
      border-radius: 8px;
    }
    .web-section {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #4b5563;
      width: 100%;
      max-width: 600px;
    }
  </style>
</head>
<body>
  <h1>NetworkFounderApp - QR Codes</h1>
  
  <div class="info">
    Scan these QR codes with your Expo Go app to open the NetworkFounderApp on your mobile device.
    Your device must be connected to the same Wi-Fi network as this computer.
  </div>
  
  <div class="button-container">
    <a href="sdk51-qr.html" class="button">Open SDK 51 QR Code</a>
    <a href="sdk53-qr.html" class="button">Open SDK 53 QR Code</a>
  </div>
  
  <div class="sdk-info">
    <div class="sdk-card">
      <strong>SDK 51 URL:</strong> $SDK51_URL<br>
      <small>Use this SDK version for better compatibility with older devices.</small>
    </div>
    <div class="sdk-card">
      <strong>SDK 53 URL:</strong> $SDK53_URL<br>
      <small>Use this SDK version for newer features and improvements.</small>
    </div>
  </div>
  
  <div class="web-section">
    <h2>Web Version</h2>
    <p>The web version is also available at these URLs:</p>
    <div class="sdk-card">
      <strong>Web (SDK 51):</strong> http://$IP_ADDRESS:8090<br>
      <strong>Web (Standalone):</strong> http://$IP_ADDRESS:3000/standalone-web.html
    </div>
  </div>
</body>
</html>
EOL

# Print info
echo "QR codes generated successfully!"
echo "Open QR codes: http://localhost:3000/qrcodes/index.html"

# Serve the directory
echo "Starting web server to view QR codes..."
npx serve -p 3000
