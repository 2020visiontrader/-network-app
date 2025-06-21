#!/bin/bash
# build-web.sh
# Script to build the web version of the app

set -e # Exit on error

SDK_VERSION=${1:-51}

echo "=== Building NetworkFounderApp Web Version (SDK $SDK_VERSION) ==="

# Make sure we have the necessary web dependencies
npm install --save react-native-web@~0.19.6 @expo/metro-runtime@~3.2.3 --legacy-peer-deps

# Make sure we're using the right SDK version
./switch-sdk.sh $SDK_VERSION

# Create build directory if it doesn't exist
mkdir -p web-build-sdk$SDK_VERSION

# Build the web version
echo "Building web version for SDK $SDK_VERSION..."
npx expo export:web --output-dir web-build-sdk$SDK_VERSION

echo "=== Web Build Complete ==="
echo "The web build is available in the web-build-sdk$SDK_VERSION directory."
echo "To serve the build, run: npx serve web-build-sdk$SDK_VERSION"

# Optionally serve the build
if [ "$2" == "serve" ]; then
  echo "Starting web server..."
  npx serve web-build-sdk$SDK_VERSION
fi
