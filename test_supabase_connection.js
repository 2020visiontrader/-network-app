#!/usr/bin/env node

/**
 * Test Supabase Connection and Diagnose Network Issues
 */

const https = require('https');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🔍 TESTING SUPABASE CONNECTION AND NETWORK ISSUES\n');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

console.log('📊 Configuration:');
console.log(`   URL: ${SUPABASE_URL}`);
console.log(`   Key: ${SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.substring(0, 20) + '...' : 'NOT SET'}\n`);

// Test 1: Basic HTTP connectivity
async function testHttpConnectivity() {
  console.log('🌐 TEST 1: HTTP Connectivity');
  
  return new Promise((resolve) => {
    const url = new URL(SUPABASE_URL);
    
    const req = https.request({
      hostname: url.hostname,
      port: 443,
      path: '/',
      method: 'HEAD',
      timeout: 5000
    }, (res) => {
      console.log(`   ✅ HTTP Status: ${res.statusCode}`);
      console.log(`   ✅ Server: ${res.headers.server || 'Unknown'}`);
      resolve(true);
    });

    req.on('error', (err) => {
      console.log(`   ❌ HTTP Error: ${err.message}`);
      if (err.code === 'ENOTFOUND') {
        console.log('   🔍 DNS Resolution failed - project may not exist');
      }
      resolve(false);
    });

    req.on('timeout', () => {
      console.log('   ❌ HTTP Timeout: Request took too long');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Test 2: Supabase client connectivity
async function testSupabaseClient() {
  console.log('\n🔧 TEST 2: Supabase Client');
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Test with a simple query that should work even without tables
    const { data, error } = await supabase
      .from('founders')
      .select('count')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('   ✅ Supabase connected (no data - schema not deployed)');
        return true;
      } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('   ✅ Supabase connected (founders table not found - schema not deployed)');
        return true;
      } else {
        console.log(`   ❌ Supabase Error: ${error.message}`);
        return false;
      }
    } else {
      console.log('   ✅ Supabase connected and founders table exists');
      return true;
    }
  } catch (err) {
    console.log(`   ❌ Supabase Client Error: ${err.message}`);
    return false;
  }
}

// Test 3: DNS Resolution
async function testDnsResolution() {
  console.log('\n🌐 TEST 3: DNS Resolution');
  
  const dns = require('dns').promises;
  const url = new URL(SUPABASE_URL);
  
  try {
    const addresses = await dns.lookup(url.hostname);
    console.log(`   ✅ DNS Resolved: ${url.hostname} → ${addresses.address}`);
    return true;
  } catch (err) {
    console.log(`   ❌ DNS Error: ${err.message}`);
    console.log('   🔍 This suggests the Supabase project does not exist');
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Network Diagnostics...\n');
  
  const dnsResult = await testDnsResolution();
  const httpResult = await testHttpConnectivity();
  const supabaseResult = await testSupabaseClient();
  
  console.log('\n📊 RESULTS SUMMARY:');
  console.log(`   DNS Resolution: ${dnsResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   HTTP Connectivity: ${httpResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Supabase Client: ${supabaseResult ? '✅ PASS' : '❌ FAIL'}`);
  
  console.log('\n🔧 RECOMMENDATIONS:');
  
  if (!dnsResult) {
    console.log('   🎯 DNS FAILURE - Supabase project does not exist');
    console.log('   📋 Action: Create new Supabase project or verify URL');
    console.log('   🌐 Go to: https://supabase.com/dashboard');
  } else if (!httpResult) {
    console.log('   🎯 HTTP FAILURE - Network connectivity issue');
    console.log('   📋 Action: Check internet connection or firewall');
  } else if (!supabaseResult) {
    console.log('   🎯 SUPABASE FAILURE - Authentication or API issue');
    console.log('   📋 Action: Verify API keys or project settings');
  } else {
    console.log('   🎯 ALL TESTS PASSED');
    console.log('   📋 Action: Deploy mobile founder schema');
    console.log('   ⚡ Run: Copy mobile_founder_schema.sql to Supabase SQL Editor');
  }
  
  console.log('\n✅ Network diagnostics complete!');
}

// Run the tests
runTests().catch(console.error);
