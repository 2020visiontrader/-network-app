// check-sdk51-setup.js
// Script to verify the SDK 51 project setup and configuration
const fs = require('fs');
const path = require('path');

console.log('=== NetworkFounderApp SDK 51 Setup Checker ===');

// Check package.json
const packageJsonPath = 'package.json';
if (fs.existsSync(packageJsonPath)) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    console.log('\nExpo SDK Version:');
    if (packageJson.dependencies && packageJson.dependencies.expo) {
      const expoVersion = packageJson.dependencies.expo;
      console.log(`Found expo: ${expoVersion}`);
      
      if (expoVersion.includes('~51')) {
        console.log('✅ Correct SDK 51 version detected');
      } else {
        console.log(`❌ Warning: This does not appear to be SDK 51 (found ${expoVersion})`);
      }
    } else {
      console.log('❌ Expo dependency not found in package.json');
    }
    
    // Check essential dependencies
    console.log('\nEssential Dependencies:');
    const essentialDeps = [
      '@expo/vector-icons',
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
    
    // Check for deprecated dependencies
    console.log('\nChecking for Deprecated Dependencies:');
    const deprecatedDeps = [
      'expo-permissions'
    ];
    
    deprecatedDeps.forEach(dep => {
      if (packageJson.dependencies && packageJson.dependencies[dep]) {
        console.log(`❌ Deprecated: ${dep}: ${packageJson.dependencies[dep]}`);
      } else {
        console.log(`✅ ${dep} not found (good)`);
      }
    });
  } catch (error) {
    console.error('Error parsing package.json:', error.message);
  }
} else {
  console.log('❌ package.json not found');
}

// Check app.json
const appJsonPath = 'app.json';
if (fs.existsSync(appJsonPath)) {
  try {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    console.log('\napp.json Configuration:');
    
    if (appJson.expo) {
      console.log(`✅ App name: ${appJson.expo.name || 'Not set'}`);
      
      // Check sdkVersion field
      if (appJson.expo.sdkVersion) {
        const sdkVersion = appJson.expo.sdkVersion;
        console.log(`Found sdkVersion: ${sdkVersion}`);
        
        if (sdkVersion.startsWith('51.')) {
          console.log('✅ Correct SDK 51 version in app.json');
        } else {
          console.log(`❌ Warning: This does not appear to be SDK 51 in app.json (found ${sdkVersion})`);
        }
      } else {
        console.log('⚠️ sdkVersion field not present in app.json');
      }
    } else {
      console.log('❌ expo configuration not found in app.json');
    }
  } catch (error) {
    console.error('Error parsing app.json:', error.message);
  }
} else {
  console.log('❌ app.json not found');
}

// Check essential files
console.log('\nEssential Files:');
const essentialFiles = [
  'App.js',
  'src'
];

essentialFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} not found`);
  }
});

console.log('\n=== SDK 51 QR Code ===');
console.log('To generate a QR code for the SDK 51 app, run:');
console.log('node sdk51-generate-qr.js');

console.log('\n=== Start SDK 51 App ===');
console.log('To start the SDK 51 app, run:');
console.log('./start-sdk51-app.sh');
