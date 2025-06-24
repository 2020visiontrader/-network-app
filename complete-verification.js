/**
 * Complete Verification Test
 * 
 * This script runs a complete end-to-end test to verify all fixes:
 * 1. Schema standardization
 * 2. RLS policy implementation
 * 3. Authentication and authorization
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Create Supabase clients
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Make sure you have the following in your .env file:');
  console.log('EXPO_PUBLIC_SUPABASE_URL');
  console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY');
  console.log('SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create different clients for different access patterns
const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
const anonClient = createClient(supabaseUrl, supabaseAnonKey);

// Test user credentials (update these if testing authenticated access)
const TEST_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD;

// Generate test data
const testUserId = crypto.randomUUID();
const testEmail = `test-${Date.now()}@example.com`;

async function runCompleteVerification() {
  console.log('🔍 COMPREHENSIVE VERIFICATION TEST');
  console.log('===============================');
  let authClient = null;
  let authenticatedUserId = null;
  
  try {
    //----------------------------------------
    // PART 1: SCHEMA VERIFICATION
    //----------------------------------------
    console.log('\n1️⃣ SCHEMA VERIFICATION');
    console.log('---------------------');
    
    // Check profile_visible column exists
    console.log('Checking profile_visible column...');
    const { data: columnData, error: columnError } = await serviceClient
      .from('founders')
      .select('profile_visible')
      .limit(1);
      
    if (columnError) {
      console.log('❌ Error accessing profile_visible column:', columnError.message);
    } else {
      console.log('✅ profile_visible column is accessible');
    }
    
    // Check is_visible column doesn't exist
    console.log('\nChecking is_visible column is removed...');
    const { data: oldColumnData, error: oldColumnError } = await serviceClient
      .from('founders')
      .select('is_visible')
      .limit(1);
      
    if (oldColumnError && oldColumnError.message.includes('column founders.is_visible does not exist')) {
      console.log('✅ is_visible column has been properly removed');
    } else if (oldColumnError) {
      console.log('❓ Error checking is_visible column:', oldColumnError.message);
    } else {
      console.log('⚠️ is_visible column still exists and should be removed');
    }
    
    //----------------------------------------
    // PART 2: ANONYMOUS ACCESS TEST
    //----------------------------------------
    console.log('\n2️⃣ ANONYMOUS ACCESS TEST');
    console.log('----------------------');
    
    // Test anonymous read
    console.log('Testing anonymous read...');
    const { data: anonReadData, error: anonReadError } = await anonClient
      .from('founders')
      .select('*')
      .limit(10);
      
    if (anonReadError) {
      console.log('✅ Anonymous read blocked with error:', anonReadError.message);
    } else if (anonReadData && anonReadData.length === 0) {
      console.log('✅ Anonymous read returned empty results (RLS working)');
    } else {
      console.log('❌ Anonymous read returned data - RLS not restricting properly');
    }
    
    // Test anonymous insert
    console.log('\nTesting anonymous insert...');
    const { data: anonInsertData, error: anonInsertError } = await anonClient
      .from('founders')
      .insert({
        user_id: testUserId,
        email: testEmail,
        full_name: 'Test User',
        profile_visible: true
      })
      .select();
      
    if (anonInsertError) {
      console.log('✅ Anonymous insert blocked with error:', anonInsertError.message);
    } else {
      console.log('❌ Anonymous insert succeeded - RLS not restricting properly');
    }
    
    //----------------------------------------
    // PART 3: AUTHENTICATED ACCESS TEST
    //----------------------------------------
    console.log('\n3️⃣ AUTHENTICATED ACCESS TEST');
    console.log('--------------------------');
    
    if (TEST_EMAIL && TEST_PASSWORD && !TEST_EMAIL.includes('YOUR_TEST_USER_EMAIL')) {
      console.log('Testing with provided credentials...');
      
      // Sign in
      console.log('\nAttempting to sign in...');
      const { data: authData, error: authError } = await anonClient.auth.signInWithPassword({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });
      
      if (authError) {
        console.log('❌ Authentication failed:', authError.message);
      } else {
        console.log('✅ Successfully authenticated as:', authData.user.email);
        authenticatedUserId = authData.user.id;
        
        // Create authenticated client
        authClient = createClient(supabaseUrl, supabaseAnonKey, {
          global: {
            headers: {
              Authorization: `Bearer ${authData.session.access_token}`
            }
          }
        });
        
        // Test reading own profile
        console.log('\nTesting read of own profile...');
        const { data: ownProfile, error: ownProfileError } = await authClient
          .from('founders')
          .select('*')
          .eq('user_id', authenticatedUserId)
          .maybeSingle();
          
        if (ownProfileError) {
          console.log('❌ Failed to read own profile:', ownProfileError.message);
        } else if (ownProfile) {
          console.log('✅ Successfully read own profile');
        } else {
          console.log('⚠️ No profile found for this user');
          
          // Try to create profile
          console.log('\nCreating profile for authenticated user...');
          const { data: createProfile, error: createProfileError } = await authClient
            .from('founders')
            .insert({
              user_id: authenticatedUserId,
              email: TEST_EMAIL,
              full_name: 'Test User',
              profile_visible: true
            })
            .select();
            
          if (createProfileError) {
            console.log('❌ Failed to create profile:', createProfileError.message);
          } else {
            console.log('✅ Successfully created profile');
          }
        }
        
        // Test reading other profiles
        console.log('\nTesting read of other visible profiles...');
        const { data: otherProfiles, error: otherProfilesError } = await authClient
          .from('founders')
          .select('*')
          .neq('user_id', authenticatedUserId)
          .eq('profile_visible', true)
          .limit(5);
          
        if (otherProfilesError) {
          console.log('❌ Failed to read other profiles:', otherProfilesError.message);
        } else {
          console.log(`✅ Successfully read ${otherProfiles.length} other visible profiles`);
        }
      }
    } else {
      console.log('⚠️ Skipping authenticated tests - no valid credentials provided');
      console.log('To test authenticated access, update TEST_USER_EMAIL and TEST_USER_PASSWORD');
    }
    
    //----------------------------------------
    // PART 4: SERVICE ROLE ACCESS TEST
    //----------------------------------------
    console.log('\n4️⃣ SERVICE ROLE ACCESS TEST');
    console.log('-------------------------');
    
    // Test service role can bypass RLS
    console.log('Testing service role access...');
    const { data: serviceData, error: serviceError } = await serviceClient
      .from('founders')
      .select('*')
      .limit(5);
      
    if (serviceError) {
      console.log('❌ Service role access failed:', serviceError.message);
    } else {
      console.log(`✅ Service role successfully accessed ${serviceData.length} records`);
    }
    
    //----------------------------------------
    // SUMMARY
    //----------------------------------------
    console.log('\n📋 VERIFICATION SUMMARY');
    console.log('====================');
    console.log('1. Schema Standardization: ' + (columnError ? '❌' : '✅'));
    console.log('2. Anonymous Access Restriction: ' + (anonInsertError ? '✅' : '❌'));
    console.log('3. Authenticated Access: ' + (authClient ? '✅' : '⚠️ Not tested'));
    console.log('4. Service Role Access: ' + (serviceError ? '❌' : '✅'));
    
    console.log('\n🔧 NEXT STEPS:');
    if (!columnError && anonInsertError && !serviceError) {
      console.log('✅ All core fixes are working correctly!');
      
      if (!authClient) {
        console.log('⚠️ Authenticated access not tested - provide valid credentials to complete testing');
      }
      
      console.log('\nTo complete implementation:');
      console.log('1. Run find-single-calls.js to identify and fix .single() calls');
      console.log('2. Test end-to-end user flows in the application');
      console.log('3. Update documentation to reflect completion');
    } else {
      console.log('❌ Some issues were detected:');
      
      if (columnError) {
        console.log('- Schema issues - run fix-visibility-column-mismatch.sql again');
      }
      
      if (!anonInsertError) {
        console.log('- RLS policy issues - run complete-rls-fix.sql again');
      }
      
      if (serviceError) {
        console.log('- Service role issues - check the service role key');
      }
    }
    
  } catch (err) {
    console.error('❌ Unexpected error during verification:', err.message);
  }
}

runCompleteVerification();
