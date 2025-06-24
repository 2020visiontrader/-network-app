/**
 * Test Authentication Helper
 * 
 * This utility helps with authenticating for test runs.
 * It provides functions to sign in as a test user or with credentials.
 */

const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

// Create clients with different keys
const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = serviceRoleKey ? 
  createClient(supabaseUrl, serviceRoleKey) : 
  null;

/**
 * Authentication utilities for testing
 */
class TestAuth {
  /**
   * Authenticate with email/password
   * @param {string} email - Email to authenticate with
   * @param {string} password - Password to authenticate with
   * @returns {Promise<Object>} Auth data and user
   */
  static async signInWithPassword(email, password) {
    console.log(`🔐 Authenticating as ${email}...`);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error(`❌ Authentication failed: ${error.message}`);
        return { success: false, error };
      }
      
      console.log(`✅ Successfully authenticated as ${email}`);
      return { success: true, data };
    } catch (error) {
      console.error(`❌ Authentication exception: ${error.message}`);
      return { success: false, error };
    }
  }
  
  /**
   * Create a test user and sign in (requires service role key)
   * @param {Object} options - Options for creating test user
   * @returns {Promise<Object>} Auth data and user
   */
  static async createAndSignInTestUser(options = {}) {
    if (!supabaseAdmin) {
      console.error('❌ Service role key not available - cannot create test user');
      return { success: false, error: 'Service role key not available' };
    }
    
    const {
      email = `test-${uuidv4()}@example.com`,
      password = 'TestPassword123!',
      userData = {}
    } = options;
    
    console.log(`🔐 Creating and authenticating as test user ${email}...`);
    
    try {
      // Create the user with admin privileges
      const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { isTestUser: true, ...userData }
      });
      
      if (createError) {
        console.error(`❌ Failed to create test user: ${createError.message}`);
        return { success: false, error: createError };
      }
      
      // Sign in as the new user
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (signInError) {
        console.error(`❌ Failed to sign in as test user: ${signInError.message}`);
        return { success: false, error: signInError, userData };
      }
      
      console.log(`✅ Successfully created and authenticated as ${email}`);
      return { 
        success: true, 
        data: authData, 
        user: userData.user,
        cleanup: async () => {
          try {
            // Delete the test user when done
            if (userData?.user?.id) {
              await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
              console.log(`✅ Test user ${email} deleted`);
            }
          } catch (e) {
            console.error(`⚠️ Failed to delete test user: ${e.message}`);
          }
        }
      };
    } catch (error) {
      console.error(`❌ Test user creation exception: ${error.message}`);
      return { success: false, error };
    }
  }
  
  /**
   * Sign in with service role (requires service role key)
   * @returns {Object} Admin client
   */
  static getServiceRoleClient() {
    if (!supabaseAdmin) {
      console.error('❌ Service role key not available');
      return null;
    }
    
    console.log('🔐 Using service role client');
    return supabaseAdmin;
  }
  
  /**
   * Get the currently authenticated user
   * @returns {Promise<Object>} Current user info
   */
  static async getCurrentUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        console.log(`⚠️ No authenticated user: ${error.message}`);
        return { authenticated: false, error };
      }
      
      if (data?.user) {
        console.log(`ℹ️ Currently authenticated as: ${data.user.email || data.user.id}`);
        return { authenticated: true, user: data.user };
      } else {
        console.log('ℹ️ No user is authenticated');
        return { authenticated: false };
      }
    } catch (error) {
      console.error(`❌ Error getting current user: ${error.message}`);
      return { authenticated: false, error };
    }
  }
  
  /**
   * Sign out the current user
   * @returns {Promise<Object>} Result
   */
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error(`❌ Error signing out: ${error.message}`);
        return { success: false, error };
      }
      
      console.log('✅ Successfully signed out');
      return { success: true };
    } catch (error) {
      console.error(`❌ Sign out exception: ${error.message}`);
      return { success: false, error };
    }
  }
}

// Export the class
module.exports = {
  TestAuth,
  supabase,
  supabaseAdmin
};

// If this script is executed directly, show current auth status
if (require.main === module) {
  (async () => {
    try {
      const status = await TestAuth.getCurrentUser();
      
      if (!status.authenticated) {
        console.log('\n🔧 To authenticate for tests, you can:');
        console.log('1. Set SUPABASE_SERVICE_ROLE_KEY in .env and use TestAuth.createAndSignInTestUser()');
        console.log('2. Create a test user in Supabase and use TestAuth.signInWithPassword()');
        console.log('3. Run the auth-for-tests.js script with email and password arguments');
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  })();
}
