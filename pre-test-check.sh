#!/bin/bash
# pre-test-check.sh
# Always run this script before executing any tests to verify database connectivity

echo "🧪 PRE-TEST ENVIRONMENT CHECK"
echo "============================"

# 1. Check if node is installed
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is not installed. Please install Node.js and try again."
  exit 1
fi

echo "✅ Node.js is installed"

# 2. Check if required npm packages are installed
echo -n "Checking required packages... "
if ! node -e "require('@supabase/supabase-js'); require('dotenv');" 2>/dev/null; then
  echo "❌"
  echo "Missing required npm packages. Installing now..."
  npm install @supabase/supabase-js dotenv
else
  echo "✅"
fi

# 3. Check if .env file exists
if [ ! -f .env ]; then
  echo "❌ .env file does not exist. Creating a template .env file..."
  cat > .env << EOF
# Supabase Connection Details
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Test User Credentials (optional)
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=password123
EOF
  
  echo "⚠️ Please edit the .env file with your actual Supabase credentials"
  exit 1
fi

echo "✅ .env file exists"

# 4. Verify database connection
echo -e "\n🔌 Verifying database connection..."
node verify-database-connection.js

# Exit if connection verification failed
if [ $? -ne 0 ]; then
  echo "❌ Database connection verification failed"
  echo "Please fix connection issues before running tests"
  exit 1
fi

echo -e "\n✅ ALL PRE-TEST CHECKS PASSED"
echo "You can now run your tests with confidence!"
echo -e "\nRecommended next steps:"
echo "1. Run RLS verification: node ultimate-rls-verification.js"
echo "2. Run schema cache verification: node verify-schema-cache-fix.js"
