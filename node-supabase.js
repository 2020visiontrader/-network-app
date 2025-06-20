const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = 'https://gbdodttegdctxvvavlqq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZG9kdHRlZ2RjdHh2dmF2bHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDk5OTEsImV4cCI6MjA2NDYyNTk5MX0.pi8qd7QiRakXvUTmOgrits457xn3aQlJHm-c0TwgLyA';

// Create a Supabase client optimized for Node.js
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

// Simple test to check connection
async function testConnection() {
  try {
    const { error } = await supabase.from('founders').select('id').limit(1);
    if (error) {
      console.log('Connection error:', error.message);
      return false;
    }
    console.log('Connection successful!');
    return true;
  } catch (err) {
    console.log('Unexpected error:', err.message);
    return false;
  }
}

// Test DB function
async function testUpsertFunction(userId, userEmail, founderData) {
  try {
    const { data, error } = await supabase.rpc('upsert_founder_onboarding', {
      user_id: userId,
      user_email: userEmail,
      founder_data: founderData
    });
    
    return { data, error };
  } catch (err) {
    return { error: err };
  }
}

module.exports = {
  supabase,
  testConnection,
  testUpsertFunction
};
