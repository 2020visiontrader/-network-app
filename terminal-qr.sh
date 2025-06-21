#!/bin/bash
# terminal-qr.sh - Display QR code in terminal and start web server

set -e # Exit on error

echo "=== NetworkFounderApp QR Codes and Web Server ==="

# Install qrcode-terminal if not present
npm list qrcode-terminal > /dev/null || {
  echo "Installing qrcode-terminal..."
  npm install --save-dev qrcode-terminal
}

# Get local IP address
IP_ADDRESS=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -n 1)

# Create and save QR codes
mkdir -p qrcodes

# Generate QR code for SDK 51
SDK51_URL="exp://$IP_ADDRESS:8081"
cat > show-qr.js << EOL
const qrcode = require('qrcode-terminal');

// Generate SDK 51 QR Code
console.log('\n\x1b[36m=== SDK 51 QR Code ===\x1b[0m');
console.log('\x1b[33mScan with Expo Go app to open on your mobile device\x1b[0m');
console.log(\`URL: $SDK51_URL\n\`);
qrcode.generate('$SDK51_URL', {small: true});

// Generate SDK 53 QR Code
console.log('\n\x1b[36m=== SDK 53 QR Code ===\x1b[0m');
console.log('\x1b[33mScan with Expo Go app to open on your mobile device\x1b[0m');
console.log(\`URL: exp://$IP_ADDRESS:8082\n\`);
qrcode.generate('exp://$IP_ADDRESS:8082', {small: true});

// Generate Web QR Code
console.log('\n\x1b[36m=== Web Version QR Code ===\x1b[0m');
console.log('\x1b[33mScan to open web version in mobile browser\x1b[0m');
console.log(\`URL: http://$IP_ADDRESS:3000\n\`);
qrcode.generate('http://$IP_ADDRESS:3000', {small: true});

console.log('\n\x1b[32mWeb server running at: \x1b[0m\x1b[1mhttp://$IP_ADDRESS:3000\x1b[0m');
console.log('\x1b[32mQR codes available at: \x1b[0m\x1b[1mhttp://$IP_ADDRESS:3000/qrcodes/index.html\x1b[0m\n');
EOL

# Display the QR codes in the terminal
node show-qr.js

# Ask which SDK to run with logs
echo ""
echo "=== Run App with Logs ==="
echo "Which SDK version would you like to run with logs?"
echo "1) SDK 51"
echo "2) SDK 53"
echo "3) Just show QR codes (no app startup)"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
  1)
    echo "Starting app with SDK 51 and showing logs..."
    ./switch-sdk.sh 51
    PORT=8081 npx expo start --port 8081 --clear
    ;;
  2)
    echo "Starting app with SDK 53 and showing logs..."
    ./switch-sdk.sh 53
    PORT=8082 npx expo start --port 8082 --clear
    ;;
  3)
    echo "Starting web server only..."
    # Start the web server in background
    (cd web-build && npx serve -p 3000) &
    echo "Web server running at http://$IP_ADDRESS:3000"
    echo "Press Ctrl+C to exit"
    wait
    ;;
  *)
    echo "Invalid choice. Exiting."
    exit 1
    ;;
esac
echo "Starting web server on port 3000..."
npx serve -p 3000
