#!/bin/bash
# run-web.sh
# Script to run the web version of the app

set -e # Exit on error

echo "=== Starting NetworkFounderApp Web Version ==="

# Make sure we have the necessary web dependencies
echo "Checking dependencies..."
npm list @expo/metro-runtime react-native-web react-dom @expo/webpack-config babel-plugin-module-resolver || {
  echo "Installing missing web dependencies..."
  npm install --save @expo/metro-runtime@~3.2.3 react-native-web@~0.19.6 react-dom@18.2.0 @expo/webpack-config@^19.0.0 babel-plugin-module-resolver --legacy-peer-deps
}

# Clear Metro cache to prevent stale builds
echo "Clearing Metro cache..."
rm -rf node_modules/.cache

# Check for any path alias issues and create symbolic links if needed
if [ -d "src/lib" ] && [ -d "src/services" ]; then
  echo "Setting up path resolution fallbacks..."
  # Create symbolic link for lib/supabase.ts if it doesn't exist
  if [ -f "src/services/supabase.js" ] && [ ! -f "src/lib/supabase.ts" ]; then
    mkdir -p src/lib
    ln -sf ../services/supabase.js src/lib/supabase.ts || echo "Couldn't create symbolic link, but continuing..."
  fi
fi

# Start the web version with debugging and a specific port to avoid conflicts
echo "Starting web server on port 8090..."

# Add NODE_OPTIONS to help with potential SSL issues
export NODE_OPTIONS=--openssl-legacy-provider
# Set debug mode
export EXPO_DEBUG=true
# Set web port
export EXPO_WEB_PORT=8090
# Disable fast refresh for first load
export EXPO_DISABLE_FAST_REFRESH=true

# Run with clear cache
npx expo start --web --clear --port 8090 --no-dev

echo "If the browser doesn't open automatically, go to: http://localhost:8090"
echo ""
echo "Troubleshooting tips:"
echo "1. If you encounter SSL or legacy provider errors, try: export NODE_OPTIONS=--openssl-legacy-provider"
echo "2. If the page doesn't load, try: npx expo start --web --port 8084 --no-dev"
echo "3. For Metro bundler issues, run: npm start -- --reset-cache"
