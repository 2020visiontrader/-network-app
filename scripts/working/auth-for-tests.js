#!/usr/bin/env node

/**
 * Authentication for Test Runs
 * 
 * This script authenticates before running tests.
 * Usage: 
 *   node auth-for-tests.js --email=test@example.com --password=password
 *   node auth-for-tests.js --create-test-user
 *   node auth-for-tests.js --status
 */

const { TestAuth } = require('./test-auth');
require('dotenv').config();

// Parse command line arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  if (arg.startsWith('--')) {
    const [key, value] = arg.substr(2).split('=');
    acc[key] = value === undefined ? true : value;
  }
  return acc;
}, {});

async function run() {
  console.log('🔐 TEST AUTHENTICATION TOOL');
  console.log('=========================');
  
  // Check current status
  const currentStatus = await TestAuth.getCurrentUser();
  
  // Handle status request
  if (args.status) {
    if (currentStatus.authenticated) {
      console.log(`\n✅ AUTHENTICATED as ${currentStatus.user.email || currentStatus.user.id}`);
    } else {
      console.log('\n❌ NOT AUTHENTICATED');
    }
    return;
  }
  
  // Handle sign out request
  if (args.logout || args.signout) {
    if (currentStatus.authenticated) {
      await TestAuth.signOut();
    } else {
      console.log('ℹ️ No user is currently authenticated');
    }
    return;
  }
  
  // If already authenticated, show message unless force flag is used
  if (currentStatus.authenticated && !args.force) {
    console.log(`\n⚠️ Already authenticated as ${currentStatus.user.email || currentStatus.user.id}`);
    console.log('To force a new login, use --force or sign out first with --logout');
    return;
  }
  
  // Create and sign in as test user
  if (args['create-test-user']) {
    const options = {};
    
    // Custom email if provided
    if (args.email) {
      options.email = args.email;
    }
    
    // Custom password if provided
    if (args.password) {
      options.password = args.password;
    }
    
    const result = await TestAuth.createAndSignInTestUser(options);
    
    if (result.success) {
      console.log('\n✅ TEST USER CREATED AND AUTHENTICATED');
      console.log(`Email: ${result.data.user.email}`);
      console.log(`User ID: ${result.data.user.id}`);
      
      // Set up automatic cleanup if requested
      if (args['auto-cleanup']) {
        process.on('SIGINT', async () => {
          console.log('\n🧹 Cleaning up test user...');
          await result.cleanup();
          process.exit();
        });
        
        console.log('\nℹ️ Press Ctrl+C to sign out and delete this test user');
      } else if (result.cleanup) {
        console.log('\nℹ️ Use the following to clean up this test user when done:');
        console.log('node auth-for-tests.js --cleanup-user=' + result.data.user.id);
      }
    }
    return;
  }
  
  // Sign in with email and password
  if (args.email && args.password) {
    const result = await TestAuth.signInWithPassword(args.email, args.password);
    
    if (result.success) {
      console.log('\n✅ AUTHENTICATED SUCCESSFULLY');
      console.log(`Email: ${result.data.user.email}`);
      console.log(`User ID: ${result.data.user.id}`);
    }
    return;
  }
  
  // No valid action specified, show help
  console.log('\n❓ Please specify how to authenticate:');
  console.log('1. Sign in with credentials:');
  console.log('   node auth-for-tests.js --email=test@example.com --password=yourpassword');
  console.log('2. Create and sign in as a test user (requires SUPABASE_SERVICE_ROLE_KEY):');
  console.log('   node auth-for-tests.js --create-test-user [--email=custom@example.com] [--auto-cleanup]');
  console.log('3. Check current authentication status:');
  console.log('   node auth-for-tests.js --status');
  console.log('4. Sign out:');
  console.log('   node auth-for-tests.js --logout');
}

run().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
