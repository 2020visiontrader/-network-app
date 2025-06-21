#!/bin/bash
# web-build.sh
# Robust script to build the NetworkFounderApp for web

set -e # Exit on error

# Colors for better visibility
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SDK_VERSION=${1:-51}

echo -e "${BLUE}=== Building NetworkFounderApp Web Version (SDK $SDK_VERSION) ===${NC}"

# Ensure SDK is set correctly
if [ -f "./switch-sdk.sh" ]; then
  echo -e "${YELLOW}Switching to SDK $SDK_VERSION...${NC}"
  ./switch-sdk.sh $SDK_VERSION
else
  echo -e "${YELLOW}SDK switching script not found. Using current SDK configuration.${NC}"
fi

# Ensure dependencies are installed
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install --legacy-peer-deps

# Make sure we have the necessary web dependencies
echo -e "${YELLOW}Installing web dependencies...${NC}"
npm install --save react-native-web@~0.19.6 @expo/metro-runtime@~3.2.3 --legacy-peer-deps
npm install --save-dev @expo/webpack-config --legacy-peer-deps

# Create the webpack config file if it doesn't exist
if [ ! -f "webpack.config.js" ]; then
  echo -e "${YELLOW}Creating webpack.config.js...${NC}"
  cat > webpack.config.js << 'EOL'
const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function(env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: [
          // Add any modules that need transpiling
        ],
      },
    },
    argv
  );
  
  // Customize the config before returning it
  return config;
};
EOL
fi

# Create web build directory
mkdir -p web-build-sdk$SDK_VERSION

# Build using expo export with correct flags
echo -e "${YELLOW}Building web version...${NC}"
# Try multiple approaches to build for web
if npx expo export:web; then
  echo -e "${GREEN}Web build completed successfully with expo export:web${NC}"
elif npx expo export --platform web; then
  echo -e "${GREEN}Web build completed successfully with expo export --platform web${NC}"
elif npx expo-cli build:web; then
  echo -e "${GREEN}Web build completed successfully with expo-cli build:web${NC}"
else
  echo -e "${RED}All web build attempts failed.${NC}"
  
  # Fallback to copying the index.html as a minimal web version
  echo -e "${YELLOW}Creating a minimal web version instead...${NC}"
  mkdir -p web-build
  cp index.html web-build/index.html
fi

# Check if build succeeded
if [ -d "web-build" ]; then
  # Copy to SDK-specific directory
  cp -R web-build/* web-build-sdk$SDK_VERSION/
  
  echo -e "${GREEN}Web build available in the ${YELLOW}web-build-sdk$SDK_VERSION${NC} directory.${NC}"
  
  # Ask if user wants to serve the build
  echo -e "${YELLOW}Do you want to serve the web build now? (y/n)${NC}"
  read -r answer
  if [[ "$answer" =~ ^[Yy]$ ]]; then
    if command -v npx &> /dev/null; then
      echo -e "${BLUE}Starting web server with npx serve...${NC}"
      npx serve web-build-sdk$SDK_VERSION
    else
      echo -e "${BLUE}Starting web server with python...${NC}"
      (cd web-build-sdk$SDK_VERSION && python -m SimpleHTTPServer 8000)
    fi
  else
    echo -e "To serve the build later, run: ${YELLOW}npx serve web-build-sdk$SDK_VERSION${NC}"
  fi
else
  echo -e "${RED}Web build failed. web-build directory not found.${NC}"
  echo -e "${YELLOW}Creating a minimal web directory with index.html...${NC}"
  
  # Create a minimal web build with just the index.html
  mkdir -p web-build-sdk$SDK_VERSION
  cp index.html web-build-sdk$SDK_VERSION/index.html
  
  echo -e "${GREEN}Minimal web version created in ${YELLOW}web-build-sdk$SDK_VERSION${NC}${GREEN}.${NC}"
  echo -e "To serve this minimal version, run: ${YELLOW}npx serve web-build-sdk$SDK_VERSION${NC}"
fi

echo -e "${BLUE}=== Web Build Process Complete ===${NC}"
