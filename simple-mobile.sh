#!/bin/bash
# simple-mobile.sh
# A simpler approach to running the mobile version (TypeScript support)

set -e # Exit on error

echo "=== Building and Running NetworkFounderApp Mobile Version (TypeScript) ==="

# Clear cache
rm -rf node_modules/.cache

# Type check TypeScript files
echo "Type checking TypeScript files..."
if ! npx tsc --noEmit; then
  echo "❌ TypeScript errors found. Please fix them before continuing."
  exit 1
fi
echo "✅ TypeScript check passed!"

# Start Expo development server
echo "Starting Expo development server..."
echo "Scan the QR code with Expo Go app to run on your device"
echo "Press Ctrl+C to stop the server"
npx expo start
