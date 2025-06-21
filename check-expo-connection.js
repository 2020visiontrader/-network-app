#!/usr/bin/env node
// check-expo-connection.js
// This script checks the Expo server connection and displays status information

const http = require('http');
const fs = require('fs');
const os = require('os');
const { networkInterfaces } = require('os');
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

console.log(`\n${colors.bright}${colors.cyan}=== CHECKING EXPO CONNECTION STATUS ===${colors.reset}\n`);

// Get all network interfaces
function getLocalIpAddresses() {
  const interfaces = networkInterfaces();
  const addresses = [];
  
  for (const iface of Object.values(interfaces)) {
    for (const alias of iface) {
      if (alias.family === 'IPv4' && !alias.internal) {
        addresses.push(alias.address);
      }
    }
  }
  
  return addresses;
}

// Check if a port is in use
function isPortInUse(port) {
  try {
    const output = execSync(`lsof -i:${port}`).toString();
    return output.length > 0;
  } catch (error) {
    return false;
  }
}

// Check Metro bundler status
function checkMetroBundler() {
  console.log(`${colors.yellow}Checking Metro bundler status:${colors.reset}`);
  
  const port = 8081; // Default Metro port
  const isRunning = isPortInUse(port);
  
  if (isRunning) {
    console.log(`${colors.green}✓ Metro bundler is running on port ${port}${colors.reset}`);
    
    // Check who's using the port
    try {
      const output = execSync(`lsof -i:${port}`).toString();
      console.log(`\nProcess using port ${port}:`);
      console.log(output);
    } catch (error) {
      console.log(`${colors.red}Could not get process details for port ${port}${colors.reset}`);
    }
  } else {
    console.log(`${colors.red}✗ Metro bundler is not running on port ${port}${colors.reset}`);
  }
}

// Check network status
function checkNetworkStatus() {
  console.log(`\n${colors.yellow}Network status:${colors.reset}`);
  
  // Get all local IP addresses
  const ipAddresses = getLocalIpAddresses();
  
  if (ipAddresses.length > 0) {
    console.log(`${colors.green}Local IP addresses:${colors.reset}`);
    ipAddresses.forEach(ip => {
      console.log(`  - ${ip}`);
    });
  } else {
    console.log(`${colors.red}No local IP addresses found${colors.reset}`);
  }
  
  // Check if Expo URL file exists
  if (fs.existsSync('./expo-url.txt')) {
    const expoUrl = fs.readFileSync('./expo-url.txt', 'utf8').trim();
    console.log(`\n${colors.cyan}Expo URL from previous run:${colors.reset} ${expoUrl}`);
    
    // Parse URL to get host and port
    const match = expoUrl.match(/exp:\/\/([\d\.]+):(\d+)/);
    if (match) {
      const [_, host, port] = match;
      console.log(`  Host: ${host}`);
      console.log(`  Port: ${port}`);
      
      // Check if it's a local address
      const isLocalHost = host === 'localhost' || host === '127.0.0.1';
      const isLocalNetwork = ipAddresses.includes(host);
      
      if (isLocalHost) {
        console.log(`  ${colors.yellow}⚠ Using localhost, which may not work for physical devices${colors.reset}`);
      } else if (isLocalNetwork) {
        console.log(`  ${colors.green}✓ Using a local network address, good for device testing${colors.reset}`);
      } else {
        console.log(`  ${colors.red}✗ Host is not on local network, may cause connection issues${colors.reset}`);
      }
    }
  } else {
    console.log(`\n${colors.yellow}No saved Expo URL found${colors.reset}`);
  }
}

// Check for common issues
function checkCommonIssues() {
  console.log(`\n${colors.yellow}Checking for common Expo connection issues:${colors.reset}`);
  
  // Check for expo-cli globally installed
  try {
    const expoVersion = execSync('npx expo --version').toString().trim();
    console.log(`${colors.green}✓ Expo CLI version: ${expoVersion}${colors.reset}`);
  } catch (error) {
    console.log(`${colors.red}✗ Expo CLI not found or not working${colors.reset}`);
  }
  
  // Check if node_modules exists
  if (fs.existsSync('./node_modules')) {
    console.log(`${colors.green}✓ node_modules directory exists${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ node_modules directory not found. Run 'npm install' first${colors.reset}`);
  }
  
  // Check if .expo directory exists
  if (fs.existsSync('./.expo')) {
    console.log(`${colors.green}✓ .expo directory exists${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠ .expo directory not found. This is expected if you haven't run Expo yet${colors.reset}`);
  }
  
  // Check available memory
  const totalMem = Math.round(os.totalmem() / (1024 * 1024 * 1024) * 10) / 10;
  const freeMem = Math.round(os.freemem() / (1024 * 1024 * 1024) * 10) / 10;
  const usedMemPercent = Math.round(((totalMem - freeMem) / totalMem) * 100);
  
  console.log(`${colors.cyan}System memory: ${freeMem}GB free of ${totalMem}GB total (${usedMemPercent}% used)${colors.reset}`);
  
  if (usedMemPercent > 90) {
    console.log(`${colors.red}⚠ High memory usage detected, which may cause Metro bundler to fail${colors.reset}`);
  }
}

// Run all checks
checkMetroBundler();
checkNetworkStatus();
checkCommonIssues();

console.log(`\n${colors.bright}${colors.green}=== CONNECTION CHECK COMPLETE ===${colors.reset}`);
console.log(`${colors.yellow}If you're having trouble connecting:${colors.reset}`);
console.log(`1. Make sure your device is on the same WiFi network as this computer`);
console.log(`2. Try restarting the Expo server with './start-expo-with-debug.js'`);
console.log(`3. On your device, try closing and reopening Expo Go`);
console.log(`4. Check your device's network settings`);
