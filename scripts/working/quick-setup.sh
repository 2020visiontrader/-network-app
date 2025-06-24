#!/bin/bash

# NetworkFounder App - Quick Development Setup
# Last Updated: June 23, 2025
# Status: TESTED and WORKING ✅

echo "🚀 NetworkFounder App - Development Setup"
echo "========================================"

# Check if in correct directory
if [ ! -f "app.json" ]; then
    echo "❌ Error: Run this script from the NetworkFounderApp root directory"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🧹 Clearing Metro cache..."
npx expo start --clear &
EXPO_PID=$!

echo "⏱️  Waiting for Expo to start..."
sleep 5

echo "📱 Generating QR code for mobile testing..."
node generate-qr.js

echo "🌐 Opening QR code in browser..."
open expo-qr-android.html

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Scan QR code with Expo Go on Android"
echo "   2. Or paste URL: exp://192.168.0.102:8081"
echo "   3. Check docs/README.md for troubleshooting"
echo ""
echo "🔧 Useful commands:"
echo "   npm run test-db    # Test database connection"
echo "   node generate-qr.js    # Regenerate QR code"
echo ""

# Keep Expo running
wait $EXPO_PID
