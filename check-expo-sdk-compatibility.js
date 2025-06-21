#!/usr/bin/env node
// check-expo-sdk-compatibility.js
// This script checks compatibility between Expo SDK, Expo Go, and dependencies

const fs = require('fs');
const { execSync } = require('child_process');

// Define terminal colors for better visibility
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m'
};

console.log(`\n${colors.bright}${colors.cyan}=== CHECKING EXPO SDK COMPATIBILITY ===${colors.reset}\n`);

// Read package.json
let packageJson;
try {
  packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`${colors.green}✓ Successfully read package.json${colors.reset}`);
} catch (error) {
  console.log(`${colors.red}✗ Error reading package.json: ${error.message}${colors.reset}`);
  process.exit(1);
}

// Extract Expo SDK version
const expoVersion = packageJson.dependencies.expo || '';
const expoSdkVersion = expoVersion.replace(/[\^~]/g, '');

console.log(`\n${colors.yellow}Expo SDK information:${colors.reset}`);
console.log(`SDK version: ${expoSdkVersion}`);

// SDK compatibility matrix
const sdkCompatibilityMatrix = {
  '49.0.0': {
    expoGoMinVersion: '2.30.0',
    notes: 'Compatible with Expo Go, may have some issues with QR code scanning in older devices'
  },
  '50.0.0': {
    expoGoMinVersion: '2.31.0',
    notes: 'Compatible with Expo Go, but with limited hot reloading capabilities'
  },
  '51.0.0': {
    expoGoMinVersion: '2.32.0',
    notes: 'SDK 51 requires the latest Expo Go app. Make sure to update your Expo Go app to at least version 2.32.0'
  },
  '52.0.0': {
    expoGoMinVersion: '2.33.0',
    notes: 'Not all features are supported in Expo Go for SDK 52'
  },
  '53.0.0': {
    expoGoMinVersion: null,
    notes: 'Not compatible with Expo Go. Use Development Builds instead'
  }
};

// Find the applicable SDK version
let compatibilityInfo = null;
for (const version in sdkCompatibilityMatrix) {
  if (expoSdkVersion.startsWith(version.split('.')[0])) {
    compatibilityInfo = sdkCompatibilityMatrix[version];
    break;
  }
}

if (compatibilityInfo) {
  console.log(`${colors.cyan}Compatibility information:${colors.reset}`);
  
  if (compatibilityInfo.expoGoMinVersion) {
    console.log(`${colors.green}✓ This SDK version is compatible with Expo Go${colors.reset}`);
    console.log(`  Minimum Expo Go version required: ${compatibilityInfo.expoGoMinVersion}`);
  } else {
    console.log(`${colors.red}✗ This SDK version is NOT compatible with Expo Go${colors.reset}`);
    console.log(`  You need to use Development Builds instead`);
  }
  
  console.log(`  Notes: ${compatibilityInfo.notes}`);
} else {
  console.log(`${colors.yellow}⚠ Unknown SDK version, compatibility information not available${colors.reset}`);
}

// Check critical dependencies
console.log(`\n${colors.yellow}Checking critical dependencies:${colors.reset}`);

const criticalDeps = [
  '@expo/metro-runtime',
  'react-native',
  'react',
  'react-dom'
];

for (const dep of criticalDeps) {
  const version = packageJson.dependencies[dep];
  if (version) {
    console.log(`${colors.green}✓ ${dep}: ${version}${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ Missing dependency: ${dep}${colors.reset}`);
  }
}

// Check for metro bundler dependencies
if (packageJson.dependencies['@expo/metro-runtime']) {
  console.log(`${colors.green}✓ @expo/metro-runtime is installed (required for web support)${colors.reset}`);
} else {
  console.log(`${colors.yellow}⚠ @expo/metro-runtime is not installed, which may affect web support${colors.reset}`);
  console.log(`  Run 'npm install @expo/metro-runtime' to install it`);
}

// Run Expo doctor if available
try {
  console.log(`\n${colors.yellow}Running Expo doctor to check for issues:${colors.reset}`);
  const doctorOutput = execSync('npx expo-doctor').toString();
  console.log(doctorOutput);
} catch (error) {
  // Expo doctor might not be available, so just show whatever output we got
  if (error.stdout) {
    console.log(error.stdout.toString());
  }
  if (error.stderr) {
    console.log(`${colors.red}${error.stderr.toString()}${colors.reset}`);
  }
}

console.log(`\n${colors.bright}${colors.green}=== COMPATIBILITY CHECK COMPLETE ===${colors.reset}`);
console.log(`${colors.yellow}Recommendations:${colors.reset}`);
console.log(`1. Make sure your Expo Go app is updated to the latest version`);
console.log(`2. For SDK 51, use Expo Go 2.32.0 or newer`);
console.log(`3. If still facing issues, try clearing cache: 'npx expo start --clear'`);
console.log(`4. Consider using './start-expo-with-debug.js' for better debugging`);
