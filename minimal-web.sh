#!/bin/bash
# minimal-web.sh
# Run a minimal web version directly

set -e # Exit on error

echo "=== Running Minimal Web Version ==="

# Check for the required packages
npm list react-dom react-native-web > /dev/null || {
  echo "Installing required packages..."
  npm install --save react-dom react-native-web --legacy-peer-deps
}

# Create a minimal HTML file
cat > index.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Network Founder App - Minimal Web</title>
  <style>
    html, body { height: 100%; margin: 0; padding: 0; background-color: #1f2937; }
    #root { height: 100%; }
    .loading { color: white; text-align: center; padding-top: 100px; font-family: system-ui, sans-serif; }
  </style>
</head>
<body>
  <div id="root">
    <div class="loading">Loading NetworkFounderApp...</div>
  </div>
  <script src="./web-build/minimal-bundle.js"></script>
</body>
</html>
EOL

# Create web-build directory if it doesn't exist
mkdir -p web-build

# Bundle the minimal web app
echo "Bundling minimal web app..."
npx esbuild minimal-web.js --bundle --outfile=web-build/minimal-bundle.js --loader:.js=jsx

# Serve the app
echo "Starting web server on port 3000..."
npx serve -p 3000

echo "Web server running at http://localhost:3000"
