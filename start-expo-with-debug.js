#!/usr/bin/env node
// start-expo-with-debug.js
// This script starts the Expo development server with verbose logging enabled

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode-terminal');

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

// Log file for Expo start output
const startLogFilePath = path.join(__dirname, 'expo-start-logs.txt');
const logStream = fs.createWriteStream(startLogFilePath, { flags: 'a' });

// Write startup header to log file
logStream.write(`\n\n=== EXPO SERVER STARTED AT ${new Date().toISOString()} ===\n\n`);

console.log(`\n${colors.bright}${colors.green}=== STARTING EXPO SERVER WITH VERBOSE LOGGING ===${colors.reset}\n`);
console.log(`${colors.yellow}Server logs will be saved to: ${startLogFilePath}${colors.reset}\n`);

// Function to extract URLs from Expo output
function extractExpoURLs(text) {
  // Look for Expo dev server URL pattern
  const urlMatch = text.match(/exp:\/\/[\d\.]+:\d+/);
  
  if (urlMatch) {
    const url = urlMatch[0];
    console.log(`\n${colors.bright}${colors.green}Expo URL detected: ${url}${colors.reset}`);
    
    // Generate and display QR code
    console.log(`\n${colors.bright}${colors.cyan}Scan this QR code in Expo Go:${colors.reset}`);
    qrcode.generate(url, { small: true });
    
    // Save the URL to a file for easy access
    fs.writeFileSync('expo-url.txt', url);
    console.log(`\n${colors.yellow}URL saved to expo-url.txt${colors.reset}`);
  }
}

// Start Expo with all debug flags enabled
const expoProcess = spawn('npx', [
  'expo', 
  'start', 
  '--dev-client',
  '--clear',
  '--verbose',
  '--no-dev-logs'
], {
  stdio: 'pipe',
  env: {
    ...process.env,
    EXPO_DEBUG: 'true',
    DEBUG: '*'
  }
});

// Process and color-code output
expoProcess.stdout.on('data', (data) => {
  const text = data.toString();
  
  // Write to log file
  logStream.write(text);
  
  // Check for URLs in the output
  extractExpoURLs(text);
  
  // Color-code based on content
  let coloredText = text;
  if (text.includes('error') || text.includes('Error')) {
    coloredText = `${colors.red}${text}${colors.reset}`;
  } else if (text.includes('warn') || text.includes('Warning')) {
    coloredText = `${colors.yellow}${text}${colors.reset}`;
  } else if (text.includes('Starting Metro Bundler') || text.includes('Starting project at')) {
    coloredText = `${colors.green}${colors.bright}${text}${colors.reset}`;
  } else if (text.includes('Expo DevTools') || text.includes('Metro waiting')) {
    coloredText = `${colors.cyan}${text}${colors.reset}`;
  }
  
  process.stdout.write(coloredText);
});

expoProcess.stderr.on('data', (data) => {
  const text = data.toString();
  logStream.write(`[ERROR] ${text}`);
  process.stderr.write(`${colors.red}${text}${colors.reset}`);
});

expoProcess.on('close', (code) => {
  logStream.write(`\n=== EXPO SERVER EXITED AT ${new Date().toISOString()} WITH CODE ${code} ===\n`);
  logStream.end();
  console.log(`\n${colors.red}Expo server exited with code ${code}${colors.reset}`);
});

// Handle clean exit
process.on('SIGINT', () => {
  console.log(`\n${colors.yellow}Stopping Expo server...${colors.reset}`);
  
  // Close log file
  logStream.write(`\n=== EXPO SERVER MANUALLY STOPPED AT ${new Date().toISOString()} ===\n`);
  logStream.end();
  
  // Kill the Expo process
  expoProcess.kill();
  
  // Exit this process
  process.exit(0);
});
