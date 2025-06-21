#!/bin/bash

# Script to generate QR code specifically for Expo Go on Android with SDK 51
# This script avoids any web-based QR codes

# Colors for better visibility
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Generating QR Code for Expo Go on Android (SDK 51) ===${NC}"

# Make sure we're on SDK 51 (if you have the switch script)
if [ -f "./switch-sdk.sh" ]; then
  echo -e "${YELLOW}Ensuring we're on SDK 51...${NC}"
  ./switch-sdk.sh 51 > /dev/null 2>&1
fi

# Check if app.json exists and contains SDK 51
if [ -f "app.json" ]; then
  if ! grep -q '"sdkVersion": "51' "app.json"; then
    echo -e "${RED}Warning: app.json may not be configured for SDK 51.${NC}"
    echo -e "${YELLOW}If you have SDK switching set up, please run './switch-sdk.sh 51' first.${NC}"
  fi
fi

# Create the required directories
mkdir -p qrcodes

# Start Expo in dev mode to get the URL, but don't keep it running
echo -e "${YELLOW}Getting Expo URL (this might take a moment)...${NC}"
EXPO_OUTPUT=$(npx expo start --no-dev --android --clear --no-web -c | head -n 100 2>&1) &
EXPO_PID=$!

# Give it some time to initialize and show the QR code
sleep 8
kill -9 $EXPO_PID > /dev/null 2>&1

# Extract the Expo URL from the output
EXPO_URL=$(echo "$EXPO_OUTPUT" | grep -o "exp://[^ ]*" | head -n 1)

if [ -z "$EXPO_URL" ]; then
  echo -e "${RED}Failed to get Expo URL. Let's try another approach.${NC}"
  
  # Try using tunnel mode which might be more reliable
  echo -e "${YELLOW}Trying with tunnel mode...${NC}"
  EXPO_OUTPUT=$(npx expo start --tunnel --no-dev --android --clear --no-web -c | head -n 100 2>&1) &
  EXPO_PID=$!
  
  # Give it more time for tunnel to establish
  sleep 15
  kill -9 $EXPO_PID > /dev/null 2>&1
  
  # Extract the Expo URL from the output
  EXPO_URL=$(echo "$EXPO_OUTPUT" | grep -o "exp://[^ ]*" | head -n 1)
fi

if [ -z "$EXPO_URL" ]; then
  echo -e "${RED}Still couldn't get the Expo URL automatically.${NC}"
  echo -e "${YELLOW}Starting full Expo session. Please scan the QR code that appears.${NC}"
  echo -e "${YELLOW}If you need to change from LAN to Tunnel mode, press 't' after Expo starts.${NC}"
  
  # Start Expo normally
  npx expo start --clear
  exit 0
fi

echo -e "${GREEN}Expo URL: $EXPO_URL${NC}"

# Generate QR code for Expo Go
echo -e "${YELLOW}Generating QR code for Expo Go on Android...${NC}"

# Generate terminal-friendly QR code
echo -e "${GREEN}QR Code for Expo Go on Android (SDK 51):${NC}"
npx qrcode-terminal "$EXPO_URL"

# Generate HTML QR code
echo -e "${YELLOW}Creating HTML QR code file...${NC}"

cat > "qrcodes/android-sdk51-qr.html" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Expo Go QR Code (SDK 51)</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      background-color: #1f2937;
      color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      padding: 20px;
    }
    h1 {
      color: #7d58ff;
      margin-bottom: 10px;
    }
    .qr-container {
      background-color: white;
      padding: 20px;
      border-radius: 10px;
      margin: 20px 0;
      text-align: center;
    }
    .url-display {
      background-color: rgba(255, 255, 255, 0.1);
      padding: 10px;
      border-radius: 5px;
      word-break: break-all;
      max-width: 500px;
      margin: 20px 0;
    }
    .instructions {
      background-color: rgba(255, 255, 255, 0.1);
      padding: 20px;
      border-radius: 10px;
      max-width: 500px;
      margin-top: 20px;
    }
    a {
      color: #7d58ff;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <h1>Expo Go QR Code (SDK 51)</h1>
  <p>Scan this QR code with the Expo Go app on your Android device</p>
  
  <div class="qr-container">
    <div id="qrcode"></div>
  </div>
  
  <div class="url-display">
    <strong>URL:</strong> $EXPO_URL
  </div>
  
  <div class="instructions">
    <h3>Instructions:</h3>
    <ol>
      <li>Install Expo Go from the Google Play Store</li>
      <li>Open Expo Go on your Android device</li>
      <li>Tap "Scan QR Code" in the Expo Go app</li>
      <li>Scan the QR code above</li>
      <li>The app should load on your device</li>
    </ol>
    <p><strong>Note:</strong> Make sure your device is on the same WiFi network as this computer.</p>
  </div>
  
  <p><a href="../index.html">← Back to main page</a></p>
  
  <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
  <script>
    // Generate QR code
    new QRCode(document.getElementById("qrcode"), {
      text: "$EXPO_URL",
      width: 256,
      height: 256,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
  </script>
</body>
</html>
EOF

echo -e "${GREEN}✓ QR code HTML file created at: qrcodes/android-sdk51-qr.html${NC}"

# Now start Expo for real
echo -e "${YELLOW}Starting Expo. Scan the QR code above with Expo Go on your Android device.${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the Expo server when you're done.${NC}"
echo ""

# Start Expo with clear terminal and no additional development tools
npx expo start --clear
