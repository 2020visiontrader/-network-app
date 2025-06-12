#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🧪 QUICK BACKEND TEST');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function quickTest() {
  // Test founder_applications table (most important for signup)
  try {
    const { data, error } = await supabase
      .from('founder_applications')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Backend Error:', error.message);
    } else {
      console.log('✅ Backend Working - founder_applications accessible');
    }
  } catch (err) {
    console.log('❌ Connection Error:', err.message);
  }
}

quickTest();
