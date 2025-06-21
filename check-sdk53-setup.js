// check-sdk53-setup.js
// Script to verify the SDK 53 project setup
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define paths
const sdk53Path = path.resolve(__dirname, '../NetworkFounderApp53');
const originalPath = __dirname;

console.log('=== NetworkFounderApp SDK 53 Setup Checker ===');

// Check if SDK 53 project exists
if (!fs.existsSync(sdk53Path)) {
  console.error(`\nERROR: SDK 53 project directory not found: ${sdk53Path}`);
  console.log('Please create it using: npx create-expo-app NetworkFounderApp53');
  process.exit(1);
}

console.log(`\nChecking SDK 53 project at: ${sdk53Path}`);

// Check package.json
const packageJsonPath = path.join(sdk53Path, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    console.log('\nExpo SDK Version:');
    if (packageJson.dependencies && packageJson.dependencies.expo) {
      console.log(`✅ expo: ${packageJson.dependencies.expo}`);
    } else {
      console.log('❌ Expo dependency not found in package.json');
    }
    
    // Check essential dependencies
    console.log('\nEssential Dependencies:');
    const essentialDeps = [
      '@expo/metro-runtime',
      '@react-navigation/native',
      'react',
      'react-native'
    ];
    
    essentialDeps.forEach(dep => {
      if (packageJson.dependencies && packageJson.dependencies[dep]) {
        console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
      } else {
        console.log(`❌ ${dep} not found`);
      }
    });
  } catch (error) {
    console.error('Error parsing package.json:', error.message);
  }
} else {
  console.log('❌ package.json not found in SDK 53 project');
}

// Check app.json
const appJsonPath = path.join(sdk53Path, 'app.json');
if (fs.existsSync(appJsonPath)) {
  try {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    console.log('\napp.json Configuration:');
    
    if (appJson.expo) {
      console.log(`✅ App name: ${appJson.expo.name || 'Not set'}`);
      
      // Check sdkVersion field (should not be present in SDK 53)
      if (appJson.expo.sdkVersion) {
        console.log(`❌ sdkVersion field present: ${appJson.expo.sdkVersion} (should be removed in SDK 53)`);
      } else {
        console.log('✅ sdkVersion field not present (correct for SDK 53)');
      }
    } else {
      console.log('❌ expo configuration not found in app.json');
    }
  } catch (error) {
    console.error('Error parsing app.json:', error.message);
  }
} else {
  console.log('❌ app.json not found in SDK 53 project');
}

// Check source files
console.log('\nSource Files:');
const requiredFiles = [
  'App.js',
  'src'
];

requiredFiles.forEach(file => {
  const filePath = path.join(sdk53Path, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} not found (needs to be copied from original project)`);
  }
});

// Check metro.config.js
const metroConfigPath = path.join(sdk53Path, 'metro.config.js');
if (fs.existsSync(metroConfigPath)) {
  console.log('✅ metro.config.js exists');
} else {
  console.log('❌ metro.config.js not found (consider copying from original project)');
}

console.log('\n=== Recommendations ===');
console.log('1. Make sure all source files are copied from the original project to the SDK 53 project');
console.log('2. Install all dependencies with: npm install --legacy-peer-deps');
console.log('3. Start the app with: npx expo start');
console.log('4. Scan the QR code with the Expo Go app on your device');

console.log('\n=== SDK 53 QR Code ===');
console.log('To generate a QR code for the SDK 53 app, run:');
console.log('node sdk53-generate-qr.js');
