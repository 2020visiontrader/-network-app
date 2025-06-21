#!/bin/bash
# serve-web.sh - Bundle and serve a standalone web version

set -e # Exit on error

echo "=== Building and Serving Standalone Web App ==="

# Install required dependencies if needed
npm list react-dom react > /dev/null || {
  echo "Installing React and ReactDOM..."
  npm install --save react-dom@18.2.0 --legacy-peer-deps
}

# Create web-build directory
mkdir -p web-build

# Bundle the app
echo "Bundling app-standalone.js to app-bundle.js..."
npx esbuild app-standalone.js --bundle --outfile=web-build/app-bundle.js --loader:.js=jsx --platform=browser

# Copy HTML file
echo "Copying index.html to web-build..."
cp index.html web-build/

# Serve the app
echo "Starting web server on port 3000..."
echo "Open http://localhost:3000 in your browser"
cd web-build && npx serve -p 3000
