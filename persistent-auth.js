const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Get credentials from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Path to store the session token
const tokenFilePath = path.join(__dirname, '.supabase_session');

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

// Get email and password from arguments
const getCredentials = () => {
  let email, password;
  
  args.forEach(arg => {
    if (arg.startsWith('--email=')) {
      email = arg.split('=')[1];
    } else if (arg.startsWith('--password=')) {
      password = arg.split('=')[1];
    }
  });
  
  return { email, password };
};

// Save session to file
const saveSession = (session) => {
  try {
    fs.writeFileSync(tokenFilePath, JSON.stringify(session));
    console.log('✅ Session saved to', tokenFilePath);
  } catch (error) {
    console.error('❌ Error saving session:', error.message);
  }
};

// Load session from file
const loadSession = () => {
  try {
    if (fs.existsSync(tokenFilePath)) {
      const data = fs.readFileSync(tokenFilePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('❌ Error loading session:', error.message);
  }
  return null;
};

// Login command
const login = async () => {
  const { email, password } = getCredentials();
  
  if (!email || !password) {
    console.error('❌ Email and password are required');
    console.error('Usage: node persistent-auth.js login --email=user@example.com --password=yourpassword');
    process.exit(1);
  }
  
  console.log(`🔐 Authenticating as ${email}...`);
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('❌ Authentication failed:', error.message);
      process.exit(1);
    }
    
    if (data && data.session) {
      console.log('✅ Authentication successful');
      console.log('User ID:', data.user.id);
      
      // Save the session
      saveSession(data.session);
      
      process.exit(0);
    } else {
      console.error('❌ No session data returned');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
};

// Logout command
const logout = async () => {
  try {
    // Restore the session if it exists
    const session = loadSession();
    if (session) {
      // Set the session
      const { error: setSessionError } = await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
      
      if (setSessionError) {
        console.error('❌ Error restoring session:', setSessionError.message);
      }
    }
    
    // Sign out
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ Logout failed:', error.message);
      process.exit(1);
    }
    
    // Remove the session file
    if (fs.existsSync(tokenFilePath)) {
      fs.unlinkSync(tokenFilePath);
    }
    
    console.log('✅ Successfully logged out');
    process.exit(0);
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
};

// Check status command
const status = async () => {
  try {
    // Restore the session if it exists
    const session = loadSession();
    if (session) {
      // Set the session
      const { error: setSessionError } = await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
      
      if (setSessionError) {
        console.error('❌ Error restoring session:', setSessionError.message);
        console.log('❌ Not authenticated');
        process.exit(1);
      }
    }
    
    // Get the current session
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Error getting session:', error.message);
      console.log('❌ Not authenticated');
      process.exit(1);
    }
    
    if (data && data.session) {
      console.log('✅ Authenticated as:', data.session.user.email);
      console.log('User ID:', data.session.user.id);
      
      // Test database access
      const { data: founders, error: foundersError } = await supabase
        .from('founders')
        .select('*')
        .limit(1);
        
      if (foundersError) {
        console.log('❌ Database access failed:', foundersError.message);
      } else {
        console.log('✅ Database access successful');
        console.log('Found', founders.length, 'founder records');
      }
      
      process.exit(0);
    } else {
      console.log('❌ Not authenticated');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
};

// Run command (execute a test script with restored session)
const run = async () => {
  if (args.length < 2) {
    console.error('❌ Script path is required');
    console.error('Usage: node persistent-auth.js run <script-path> [args]');
    process.exit(1);
  }
  
  const scriptPath = args[1];
  const scriptArgs = args.slice(2);
  
  // Check if script exists
  if (!fs.existsSync(scriptPath)) {
    console.error(`❌ Script not found: ${scriptPath}`);
    process.exit(1);
  }
  
  // Load session and store in environment variable
  const session = loadSession();
  if (session) {
    // Store session in environment variables for the child process
    process.env.SUPABASE_ACCESS_TOKEN = session.access_token;
    process.env.SUPABASE_REFRESH_TOKEN = session.refresh_token;
    
    console.log(`🔄 Running ${scriptPath} with authenticated session`);
    
    // Spawn the script with the session
    const { spawn } = require('child_process');
    const child = spawn('node', [scriptPath, ...scriptArgs], {
      stdio: 'inherit',
      env: process.env
    });
    
    // Handle the script's exit
    child.on('close', (code) => {
      process.exit(code);
    });
  } else {
    console.error('❌ No authentication session found');
    console.error('Please login first: node persistent-auth.js login --email=user@example.com --password=yourpassword');
    process.exit(1);
  }
};

// Execute the appropriate command
switch (command) {
  case 'login':
    login();
    break;
  case 'logout':
    logout();
    break;
  case 'status':
    status();
    break;
  case 'run':
    run();
    break;
  default:
    console.error('❌ Unknown command:', command);
    console.error('Available commands: login, logout, status, run');
    process.exit(1);
}
