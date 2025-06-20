// capture-expo-logs.js
// This script captures and displays logs from your Expo app

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

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

// Log file location
const logFilePath = path.join(__dirname, 'expo-debug-logs.txt');

/**
 * Checks if this is an Expo project
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
 * Starts capturing logs from Expo
 */
function captureLogs() {
  console.log(`\n${colors.bright}${colors.green}=== CAPTURING EXPO LOGS ===${colors.reset}\n`);
  console.log(`${colors.yellow}This script will capture and display logs from your Expo app.${colors.reset}`);
  console.log(`${colors.yellow}Logs will also be saved to: ${logFilePath}${colors.reset}\n`);
  
  // Open log file for writing
  const logFile = fs.createWriteStream(logFilePath, { flags: 'a' });
  logFile.write(`\n\n=== EXPO LOGS STARTED AT ${new Date().toISOString()} ===\n\n`);
  
  try {
    // Check if npm or yarn is used
    const hasYarnLock = fs.existsSync('yarn.lock');
    
    // Command to use for logs
    const cmd = hasYarnLock ? 'yarn' : 'npx';
    const args = hasYarnLock ? ['expo', 'logs'] : ['expo', 'logs'];
    
    console.log(`${colors.cyan}Starting Expo logs capture...${colors.reset}\n`);
    
    // Start capturing logs
    const logProcess = spawn(cmd, args, { 
      stdio: 'pipe'
    });
    
    // Process and color-code logs
    logProcess.stdout.on('data', (data) => {
      const text = data.toString();
      
      // Write to log file
      logFile.write(text);
      
      // Color-code based on log type
      let coloredText = text;
      if (text.includes('ERROR') || text.includes('error')) {
        coloredText = `${colors.red}${text}${colors.reset}`;
      } else if (text.includes('WARN') || text.includes('warn')) {
        coloredText = `${colors.yellow}${text}${colors.reset}`;
      } else if (text.includes('DEBUG') || text.includes('debug')) {
        coloredText = `${colors.blue}${text}${colors.reset}`;
      } else if (text.includes('INFO') || text.includes('info')) {
        coloredText = `${colors.green}${text}${colors.reset}`;
      }
      
      process.stdout.write(coloredText);
    });
    
    logProcess.stderr.on('data', (data) => {
      const text = data.toString();
      logFile.write(text);
      process.stderr.write(`${colors.red}${text}${colors.reset}`);
    });
    
    logProcess.on('close', (code) => {
      logFile.write(`\n=== EXPO LOGS ENDED AT ${new Date().toISOString()} WITH CODE ${code} ===\n`);
      logFile.end();
      console.log(`\n${colors.red}Expo logs capture exited with code ${code}${colors.reset}`);
    });
    
    // Keep the script running
    process.stdin.resume();
    
    // Handle clean exit
    process.on('SIGINT', () => {
      console.log(`\n${colors.yellow}Stopping logs capture...${colors.reset}`);
      
      // Close log file
      logFile.write(`\n=== EXPO LOGS MANUALLY STOPPED AT ${new Date().toISOString()} ===\n`);
      logFile.end();
      
      // Kill the child process
      logProcess.kill();
      
      // Exit this process
      process.exit(0);
    });
    
  } catch (error) {
    logFile.write(`\nERROR: ${error.message}\n`);
    logFile.end();
    
    console.log(`${colors.red}Error capturing logs:${colors.reset}`);
    console.error(error);
    process.exit(1);
  }
}

// Make sure qrcode-terminal is installed
function ensureDependencies() {
  try {
    require('qrcode-terminal');
  } catch (error) {
    console.log(`${colors.yellow}Installing required dependencies...${colors.reset}`);
    try {
      const hasYarnLock = fs.existsSync('yarn.lock');
      if (hasYarnLock) {
        spawn('yarn', ['add', 'qrcode-terminal', '--dev'], { stdio: 'inherit' });
      } else {
        spawn('npm', ['install', 'qrcode-terminal', '--save-dev'], { stdio: 'inherit' });
      }
      console.log(`${colors.green}Dependencies installed!${colors.reset}`);
    } catch (installError) {
      console.log(`${colors.red}Error installing dependencies:${colors.reset}`);
      console.error(installError);
      process.exit(1);
    }
  }
}

// Main execution
if (checkForExpo()) {
  ensureDependencies();
  captureLogs();
}
