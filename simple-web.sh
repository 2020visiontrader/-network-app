#!/bin/bash
# simple-web.sh
# A simpler approach to running the web version (TypeScript support)

set -e # Exit on error

echo "=== Building and Running NetworkFounderApp Web Version (TypeScript) ==="

# Clear cache
rm -rf node_modules/.cache

# Type check TypeScript files
echo "Type checking TypeScript files..."
if ! npx tsc --noEmit; then
  echo "❌ TypeScript errors found. Please fix them before continuing."
  exit 1
fi
echo "✅ TypeScript check passed!"

# Build web version
echo "Building web version..."
if ! npx expo export:web; then
  echo "❌ Failed to build web version. See errors above."
  exit 1
fi
echo "✅ Web build successful!"

# Serve the web build
echo "Starting web server on port 3000..."
if ! npx serve web-build -p 3000; then
  echo "❌ Failed to start web server. Port 3000 might be in use."
  exit 1
fi

echo "Web server running at http://localhost:3000"
