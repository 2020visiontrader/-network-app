#!/bin/bash

echo "🚀 Setting up Network Founder App..."

# Remove any conflicting cache
echo "📦 Cleaning cache..."
rm -rf .expo
rm -rf node_modules/.cache

# Fix Expo dependencies
echo "🔧 Fixing Expo configuration..."
npx expo install --fix

# Install any missing dependencies
echo "📱 Installing dependencies..."
npm install

# Start the development server
echo "🎯 Starting development server..."
npx expo start --clear

echo "✅ Setup complete! Scan the QR code with Expo Go app on your phone."
