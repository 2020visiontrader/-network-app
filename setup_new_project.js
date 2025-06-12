#!/usr/bin/env node

/**
 * Quick Setup Script for New Supabase Project
 */

const fs = require('fs');
const readline = require('readline');

console.log('🚀 NETWORK APP - NEW SUPABASE PROJECT SETUP\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function setupProject() {
  console.log('📋 This script will help you set up a new Supabase project for the Network App.\n');
  
  console.log('🎯 STEP 1: Create Supabase Project');
  console.log('   1. Go to: https://supabase.com/dashboard');
  console.log('   2. Click "New Project"');
  console.log('   3. Name: "Network App - Mobile Founder Platform"');
  console.log('   4. Wait for project creation (2-3 minutes)\n');
  
  const projectUrl = await askQuestion('📊 Enter your new Project URL (https://xxxxx.supabase.co): ');
  const anonKey = await askQuestion('🔑 Enter your anon/public key: ');
  const serviceKey = await askQuestion('🔐 Enter your service_role key: ');
  
  // Validate inputs
  if (!projectUrl.includes('supabase.co')) {
    console.log('❌ Invalid project URL. Should be like: https://xxxxx.supabase.co');
    rl.close();
    return;
  }
  
  if (!anonKey.startsWith('eyJ') || !serviceKey.startsWith('eyJ')) {
    console.log('❌ Invalid keys. They should start with "eyJ"');
    rl.close();
    return;
  }
  
  // Create .env file
  const envContent = `# NEW SUPABASE PROJECT - MOBILE FOUNDER PLATFORM
SUPABASE_URL=${projectUrl}
SUPABASE_ANON_KEY=${anonKey}
SUPABASE_SERVICE_ROLE_KEY=${serviceKey}

# OLD PROJECT BACKUP (for reference)
# OLD_SUPABASE_URL=https://gbdodttegdctxvvavlqq.supabase.co
# OLD_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZG9kdHRlZ2RjdHh2dmF2bHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDk5OTEsImV4cCI6MjA2NDYyNTk5MX0.pi8qd7QiRakXvUTmOgrits457xn3aQlJHm-c0TwgLyA
# OLD_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZG9kdHRlZ2RjdHh2dmF2bHFxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTA0OTk5MSwiZXhwIjoyMDY0NjI1OTkxfQ.bwaSvWzocekwfK_mbdq4JtxHqK08tRHaWBPigI_53C8
`;
  
  // Backup old .env
  if (fs.existsSync('.env')) {
    fs.writeFileSync('.env.backup', fs.readFileSync('.env'));
    console.log('\n💾 Backed up old .env to .env.backup');
  }
  
  // Write new .env
  fs.writeFileSync('.env', envContent);
  console.log('✅ Created new .env file with your credentials\n');
  
  console.log('🎯 NEXT STEPS:');
  console.log('   1. 📊 Go to SQL Editor in your Supabase project');
  console.log('   2. 📋 Copy ALL contents of mobile_founder_schema.sql');
  console.log('   3. 📝 Paste into SQL Editor and click "Run"');
  console.log('   4. ✅ Run: npm run verify-schema');
  console.log('   5. 🚀 Run: npm run dev\n');
  
  console.log('📄 Schema file location: ./mobile_founder_schema.sql');
  console.log('📊 Schema size: 631 lines, 12 founder tables\n');
  
  console.log('🎉 Setup complete! Deploy the schema and restart your dev server.');
  
  rl.close();
}

setupProject().catch(console.error);
