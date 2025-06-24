// Simple Database Connection Test
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing with URL:', supabaseUrl);
console.log('Key exists:', !!supabaseKey);

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('Attempting to connect to database...');
    
    // Simple connection test
    const { data, error } = await supabase.from('founders').select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      console.error('Connection failed:', error);
      return false;
    }
    
    console.log('Connection successful!');
    console.log('Founder count:', data);
    return true;
  } catch (err) {
    console.error('Unexpected error:', err);
    return false;
  }
}

testConnection();
