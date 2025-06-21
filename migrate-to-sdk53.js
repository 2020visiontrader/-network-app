// migrate-to-sdk53.js
// Helper script to migrate files from the old SDK 51 project to the new SDK 53 project
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define source and destination paths
const sourceDir = path.resolve(__dirname); // Current (SDK 51) project directory
const targetDir = path.resolve(__dirname, '../NetworkFounderApp53'); // SDK 53 project directory

console.log('=== NetworkFounderApp Migration Helper ===');
console.log(`\nSource directory: ${sourceDir}`);
console.log(`Target directory: ${targetDir}`);

// Check if target directory exists
if (!fs.existsSync(targetDir)) {
  console.error(`\nERROR: Target directory does not exist: ${targetDir}`);
  console.log('Please make sure you\'ve created the SDK 53 project using:');
  console.log('npx create-expo-app NetworkFounderApp53');
  process.exit(1);
}

console.log('\n=== Migration Steps ===');
console.log('\n1. Copy App.js to the SDK 53 project');
console.log('2. Copy the src directory and all its contents');
console.log('3. Copy any other necessary assets');
console.log('4. Make sure all dependencies are installed in the SDK 53 project');
console.log('5. Generate a QR code for the SDK 53 app');

console.log('\n=== Manual Steps Required ===');
console.log('To complete the migration, perform these steps manually:');
console.log('\n1. Navigate to the SDK 53 project:');
console.log(`   cd "${targetDir}"`);
console.log('\n2. Install dependencies (if not already done):');
console.log('   npm install --legacy-peer-deps');
console.log('\n3. Start the Expo development server:');
console.log('   npx expo start');
console.log('\n4. Test the app on your device by scanning the QR code');

console.log('\n=== QR Code Generation ===');
console.log('To generate a QR code for the SDK 53 app, run:');
console.log('node sdk53-generate-qr.js');

console.log('\n=== Notes ===');
console.log('- Make sure both projects are on the same level in your file structure');
console.log('- Test thoroughly after migration to ensure all features work');
console.log('- Review any deprecated APIs and update them to SDK 53 compatible versions');
