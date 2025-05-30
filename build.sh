#!/bin/bash

# Netlify build script for Network app
echo "🚀 Starting Network app build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the application
echo "🔨 Building Next.js application..."
npm run build

echo "✅ Build completed successfully!"
