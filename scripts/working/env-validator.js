#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * 
 * This script MUST be run before any testing to ensure all required 
 * environment variables are properly configured.
 * 
 * Usage: node scripts/working/env-validator.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 ENVIRONMENT VARIABLE VALIDATION');
console.log('==================================\n');

// Required environment variables
const REQUIRED_ENV_VARS = [
  {
    name: 'EXPO_PUBLIC_SUPABASE_URL',
    description: 'Supabase project URL',
    pattern: /^https:\/\/[a-z0-9]+\.supabase\.co$/,
    example: 'https://yourprojectid.supabase.co'
  },
  {
    name: 'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    description: 'Supabase anonymous/public key',
    pattern: /^eyJ[A-Za-z0-9_.-]+$/,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
];

// Optional environment variables (for admin/service operations)
const OPTIONAL_ENV_VARS = [
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    description: 'Supabase service role key (for admin operations)',
    pattern: /^eyJ[A-Za-z0-9_.-]+$/,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
];

function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '..', '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ CRITICAL: .env file not found!');
    console.log(`   Expected location: ${envPath}`);
    console.log('   Create .env file with required variables\n');
    return null;
  }
  
  console.log('✅ Found .env file');
  
  // Parse .env file manually (simple implementation)
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return envVars;
}

function validateEnvVar(envVar, value) {
  if (!value) {
    console.log(`❌ ${envVar.name}: MISSING`);
    console.log(`   Description: ${envVar.description}`);
    console.log(`   Example: ${envVar.example}\n`);
    return false;
  }
  
  if (!envVar.pattern.test(value)) {
    console.log(`❌ ${envVar.name}: INVALID FORMAT`);
    console.log(`   Current value: ${value.substring(0, 50)}...`);
    console.log(`   Description: ${envVar.description}`);
    console.log(`   Expected format: ${envVar.example}\n`);
    return false;
  }
  
  console.log(`✅ ${envVar.name}: Valid`);
  console.log(`   Value: ${value.substring(0, 30)}...${value.substring(value.length - 10)}\n`);
  return true;
}

function validateAllVariables() {
  const envVars = loadEnvFile();
  
  if (!envVars) {
    return false;
  }
  
  let allValid = true;
  
  console.log('📋 VALIDATING REQUIRED VARIABLES:');
  console.log('--------------------------------');
  
  for (const envVar of REQUIRED_ENV_VARS) {
    const isValid = validateEnvVar(envVar, envVars[envVar.name]);
    if (!isValid) {
      allValid = false;
    }
  }
  
  console.log('📋 CHECKING OPTIONAL VARIABLES:');
  console.log('-------------------------------');
  
  for (const envVar of OPTIONAL_ENV_VARS) {
    const value = envVars[envVar.name];
    if (value) {
      validateEnvVar(envVar, value);
    } else {
      console.log(`⚪ ${envVar.name}: Not set (optional)`);
      console.log(`   Description: ${envVar.description}\n`);
    }
  }
  
  return allValid;
}

function displaySummary(isValid) {
  console.log('🎯 VALIDATION SUMMARY');
  console.log('====================');
  
  if (isValid) {
    console.log('✅ ALL REQUIRED ENVIRONMENT VARIABLES ARE VALID');
    console.log('');
    console.log('✅ Safe to run tests and scripts');
    console.log('✅ Environment is properly configured');
    console.log('');
    console.log('📝 Quick Commands:');
    console.log('   npm run test-db     # Test database connection');
    console.log('   npm run dev         # Start development server');
    console.log('   npm run generate-qr # Generate QR code for mobile testing');
    console.log('');
  } else {
    console.log('❌ ENVIRONMENT VALIDATION FAILED');
    console.log('');
    console.log('🔧 TO FIX:');
    console.log('1. Create or update .env file with correct values');
    console.log('2. Get credentials from Supabase dashboard:');
    console.log('   - Go to Project Settings → API');
    console.log('   - Copy Project URL and anon key');
    console.log('3. Re-run this validation script');
    console.log('');
    console.log('📄 Example .env file:');
    console.log('EXPO_PUBLIC_SUPABASE_URL=https://yourprojectid.supabase.co');
    console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
    console.log('');
    process.exit(1);
  }
}

function testConnection() {
  console.log('🔌 TESTING SUPABASE CONNECTION');
  console.log('===============================');
  
  const envVars = loadEnvFile();
  if (!envVars) return;
  
  const { createClient } = require('@supabase/supabase-js');
  
  const supabase = createClient(
    envVars.EXPO_PUBLIC_SUPABASE_URL,
    envVars.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    }
  );
  
  return supabase.from('founders').select('count').limit(1)
    .then(({ data, error }) => {
      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('relation') && error.message.includes('does not exist')) {
          console.log('✅ Connection successful (schema not deployed yet)');
          console.log('   Note: Run database schema in Supabase SQL Editor');
        } else {
          console.log('❌ Connection failed:', error.message);
          return false;
        }
      } else {
        console.log('✅ Connection and schema successful');
      }
      return true;
    })
    .catch(err => {
      console.log('❌ Connection test failed:', err.message);
      return false;
    });
}

// Main execution
async function main() {
  const isValid = validateAllVariables();
  
  if (isValid) {
    await testConnection();
  }
  
  displaySummary(isValid);
}

main().catch(console.error);
