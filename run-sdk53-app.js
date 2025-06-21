// run-sdk53-app.js
// Script to run the SDK 53 app and generate a QR code
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Path to the SDK 53 project
const sdk53Path = path.resolve(__dirname, '../NetworkFounderApp53');

console.log('=== Starting NetworkFounderApp SDK 53 ===');

// Check if the SDK 53 directory exists
if (!fs.existsSync(sdk53Path)) {
  console.error(`\nERROR: SDK 53 project directory not found: ${sdk53Path}`);
  console.log('Please make sure you\'ve created the SDK 53 project using:');
  console.log('npx create-expo-app NetworkFounderApp53');
  process.exit(1);
}

console.log(`\nRunning Expo in: ${sdk53Path}`);
console.log('\nStarting Expo development server...');
console.log('This will open a new terminal window and generate a QR code.');
console.log('\nIMPORTANT: Make sure your device is on the same WiFi network as this computer.');

// Determine the appropriate command based on the OS
let command, args;
if (process.platform === 'darwin') {
  // macOS
  command = 'osascript';
  args = [
    '-e',
    `tell application "Terminal" to do script "cd \\"${sdk53Path}\\" && npx expo start"`
  ];
} else if (process.platform === 'win32') {
  // Windows
  command = 'cmd.exe';
  args = [
    '/c',
    'start',
    'cmd.exe',
    '/k',
    `cd /d "${sdk53Path}" && npx expo start`
  ];
} else {
  // Linux and others
  command = 'gnome-terminal';
  args = [
    '--',
    'bash',
    '-c',
    `cd "${sdk53Path}" && npx expo start; exec bash`
  ];
}

// Start the process
const process = spawn(command, args);

process.on('error', (err) => {
  console.error('Failed to start Expo:', err);
  console.log('\nPlease run the following commands manually:');
  console.log(`cd "${sdk53Path}"`);
  console.log('npx expo start');
});

console.log('\nExpo server starting in a new terminal window.');
console.log('Scan the QR code that appears in the new terminal window with the Expo Go app.');
