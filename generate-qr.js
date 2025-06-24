const qrcode = require('qrcode-terminal');
const fs = require('fs');

// Get the current Expo LAN URL
const expoUrl = 'exp://192.168.0.102:8081';

console.log('🔗 Current Expo URL:', expoUrl);
console.log('📱 Generating QR code for Android Expo Go...\n');

// Generate QR code in terminal
qrcode.generate(expoUrl, {small: false});

console.log('\n✅ Scan with Expo Go app on Android');
console.log('🌐 Or manually enter this URL in Expo Go: ' + expoUrl);

// Also create an HTML file with a proper QR image
const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(expoUrl)}`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NetworkFounder App - Expo QR</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            color: white;
        }
        .container {
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
            border: 1px solid rgba(255, 255, 255, 0.18);
            max-width: 500px;
        }
        .qr-image {
            background: white;
            padding: 20px;
            border-radius: 15px;
            margin: 20px 0;
            display: inline-block;
        }
        h1 {
            margin-bottom: 20px;
            font-size: 2.2em;
        }
        .instructions {
            max-width: 400px;
            margin: 20px auto;
            font-size: 1.1em;
            line-height: 1.6;
        }
        .url {
            background: rgba(255, 255, 255, 0.2);
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            font-family: monospace;
            word-break: break-all;
            font-size: 0.9em;
        }
        .status {
            margin-top: 20px;
            font-size: 0.9em;
            opacity: 0.8;
            padding: 10px;
            background: rgba(0, 255, 0, 0.1);
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📱 NetworkFounder App</h1>
        <h2>🚀 Expo Go - Android</h2>
        
        <div class="qr-image">
            <img src="${qrApiUrl}" alt="Expo QR Code" width="300" height="300" />
        </div>

        <div class="instructions">
            <h3>📋 Scan with Expo Go:</h3>
            <ol style="text-align: left;">
                <li><strong>Open Expo Go</strong> app on Android</li>
                <li><strong>Tap "Scan QR Code"</strong></li>
                <li><strong>Point camera</strong> at QR code above</li>
                <li><strong>App loads automatically!</strong></li>
            </ol>
        </div>

        <div class="url">
            <strong>Direct URL:</strong><br>
            ${expoUrl}
        </div>

        <div class="status">
            ✅ Expo SDK 53 | 🔗 Tunnel Active | 📱 Ready for Android
        </div>
        
        <div style="margin-top: 15px; font-size: 0.8em;">
            <em>If QR doesn't work, copy the URL above and paste it in Expo Go app</em>
        </div>
    </div>
</body>
</html>`;

// Write the HTML file
fs.writeFileSync('expo-qr-android.html', html);
console.log('\n✅ QR code page generated: expo-qr-android.html');
console.log('\nMake sure your device is on the same WiFi network as this computer.');
