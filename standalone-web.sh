#!/bin/bash
# standalone-web.sh - Serve a completely standalone web page

set -e # Exit on error

echo "=== Serving Standalone Web Page ==="
echo "Access at http://localhost:3000/standalone-web.html"

# Create copy in web-build directory
mkdir -p web-build
cp standalone-web.html web-build/

# Serve the standalone web page
npx serve -p 3000
