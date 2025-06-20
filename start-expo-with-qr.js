// start-expo-with-qr.js
// This script starts the Expo server and displays a QR code for testing on a real device

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const qrcode = require('qrcode-terminal');

// Define terminal colors for better visibility
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

/**
 * Checks if the package.json has Expo-related dependencies
 */
function checkForExpo() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const hasExpo = packageJson.dependencies.expo || packageJson.dependencies['expo-dev-client'];
    
    if (!hasExpo) {
      console.log(`${colors.red}Error: This doesn't appear to be an Expo project. Expo dependency not found in package.json${colors.reset}`);
      process.exit(1);
    }
    
    // Check Expo SDK version
    let expoVersion = packageJson.dependencies.expo || '';
    expoVersion = expoVersion.replace('^', '').replace('~', '');
    
    console.log(`${colors.cyan}Detected Expo SDK version: ${expoVersion}${colors.reset}`);
    
    return true;
  } catch (error) {
    console.log(`${colors.red}Error: Could not read package.json${colors.reset}`);
    console.error(error);
    process.exit(1);
  }
}

/**
 * Gets the local IP address for the QR code
 */
function getLocalIpAddress() {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  
  return '192.168.0.1'; // Fallback IP if we can't detect it
}

/**
 * Starts the Expo development server and monitors output for the QR code URL
 */
function startExpo() {
  console.log(`\n${colors.bright}${colors.green}=== STARTING EXPO SERVER AND GENERATING QR CODE ===${colors.reset}\n`);
  console.log(`${colors.yellow}This will start your Expo project and display a QR code for testing.${colors.reset}`);
  console.log(`${colors.yellow}Scan the QR code with the Expo Go app on your device.${colors.reset}\n`);
  
  try {
    // Check if npm or yarn is used
    const hasYarnLock = fs.existsSync('yarn.lock');
    const packageManager = hasYarnLock ? 'yarn' : 'npm run';
    
    // Start Expo and capture output
    console.log(`${colors.cyan}Starting Expo development server...${colors.reset}\n`);
    
    // Create a detached process that will continue running
    const ip = getLocalIpAddress();
    console.log(`${colors.cyan}Local IP address: ${ip}${colors.reset}`);
    
    // Generate expected Expo URL
    const expoUrl = `exp://${ip}:8081`;
    
    // Start the process
    console.log(`${colors.green}Starting Expo server in the background...${colors.reset}`);
    const cmd = hasYarnLock ? 'yarn' : 'npm';
    const args = hasYarnLock ? ['start'] : ['run', 'start'];
    
    const expoProcess = spawn(cmd, args, { 
      detached: false,
      stdio: 'pipe',
      env: {
        ...process.env,
        EXPO_QR_CODE_PREFERENCES: 'terminal' 
      }
    });
    
    // Log that we're generating the QR code
    console.log(`\n${colors.green}Generating QR code for: ${expoUrl}${colors.reset}`);
    console.log(`\n${colors.yellow}Scan this QR code with the Expo Go app:${colors.reset}\n`);
    
    // Generate QR code with the expected URL
    qrcode.generate(expoUrl, {small: true});
    
    console.log(`\n${colors.cyan}Or manually enter this URL in Expo Go: ${expoUrl}${colors.reset}`);
    console.log(`\n${colors.yellow}Make sure your device is on the same WiFi network as this computer.${colors.reset}`);
    
    // Show Expo logs
    console.log(`\n${colors.green}Expo server output:${colors.reset}`);
    
    expoProcess.stdout.on('data', (data) => {
      process.stdout.write(data);
    });
    
    expoProcess.stderr.on('data', (data) => {
      process.stderr.write(data);
    });
    
    expoProcess.on('close', (code) => {
      console.log(`\n${colors.red}Expo process exited with code ${code}${colors.reset}`);
    });
    
    // Keep the script running
    process.stdin.resume();
    
    // Handle clean exit
    process.on('SIGINT', () => {
      console.log(`\n${colors.yellow}Stopping Expo server...${colors.reset}`);
      
      // Kill the child process
      expoProcess.kill();
      
      // Exit this process
      process.exit(0);
    });
    
  } catch (error) {
    console.log(`${colors.red}Error starting Expo:${colors.reset}`);
    console.error(error);
    process.exit(1);
  }
}

// Main execution
if (checkForExpo()) {
  startExpo();
}
