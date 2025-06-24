const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Create a Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

// Create clients with different keys
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseService = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey) 
  : null;

async function checkAuthStatus() {
  console.log('🔐 CHECKING AUTHENTICATION STATUS');
  console.log('================================');
  
  try {
    // Check current session
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('❌ Error checking session:', error.message);
      return;
    }
    
    if (data && data.session) {
      console.log('✅ Authenticated as:', data.session.user.email);
      console.log('🆔 User ID:', data.session.user.id);
      
      // Test founders table access with anon key
      console.log('\n🧪 Testing founders table access with anon key...');
      const { data: founders, error: foundersError } = await supabase
        .from('founders')
        .select('*')
        .limit(1);
        
      if (foundersError) {
        console.log('❌ Cannot access founders table:', foundersError.message);
      } else {
        console.log('✅ Successfully accessed founders table');
        console.log('📊 Found', founders.length, 'records');
      }
    } else {
      console.log('❌ Not authenticated');
    }
    
    // Test with service role if available
    if (supabaseService) {
      console.log('\n🧪 Testing with service role key...');
      const { data: serviceFounders, error: serviceError } = await supabaseService
        .from('founders')
        .select('*')
        .limit(1);
        
      if (serviceError) {
        console.log('❌ Service role cannot access founders:', serviceError.message);
      } else {
        console.log('✅ Service role successfully accessed founders table');
        console.log('📊 Found', serviceFounders.length, 'records');
      }
    } else {
      console.log('\n⚠️ No service role key found in environment variables');
      console.log('💡 Set SUPABASE_SERVICE_KEY to test service role access');
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

checkAuthStatus();
