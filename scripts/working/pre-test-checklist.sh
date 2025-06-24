#!/bin/bash

# Pre-Test Checklist Script
# This script MUST be run before any testing to ensure environment is ready

echo "🔍 PRE-TEST ENVIRONMENT CHECKLIST"
echo "================================="
echo

# Function to check if command succeeded
check_status() {
    if [ $? -eq 0 ]; then
        echo "✅ $1"
    else
        echo "❌ $1"
        echo "🚨 CRITICAL: Fix this issue before proceeding with tests"
        exit 1
    fi
}

# Check 1: .env file exists
echo "1️⃣ Checking .env file..."
if [ -f ".env" ]; then
    check_status ".env file exists"
else
    echo "❌ .env file missing"
    echo "🚨 CRITICAL: Create .env file with Supabase credentials"
    echo "📄 See docs/working-configs/environment-setup.md for template"
    exit 1
fi

# Check 2: Validate environment variables
echo
echo "2️⃣ Validating environment variables..."
node scripts/working/env-validator.js
check_status "Environment variables valid"

# Check 3: Test database connection
echo
echo "3️⃣ Testing database connection..."
npm run test-db > /dev/null 2>&1
check_status "Database connection successful"

# Check 4: Verify required files exist
echo
echo "4️⃣ Checking required project files..."

required_files=(
    "app.json"
    "src/services/supabase.ts"
    "src/lib/supabase.ts"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file missing"
        exit 1
    fi
done

# Check 5: Verify app.json configuration
echo
echo "5️⃣ Checking app.json configuration..."
if grep -q "supabaseUrl" app.json && grep -q "supabaseAnonKey" app.json; then
    check_status "app.json has Supabase configuration"
else
    echo "❌ app.json missing Supabase configuration"
    echo "🚨 Add supabaseUrl and supabaseAnonKey to extra section"
    exit 1
fi

# Check 6: TypeScript compilation
echo
echo "6️⃣ Checking TypeScript compilation..."
npx tsc --noEmit > /dev/null 2>&1
if [ $? -eq 0 ]; then
    check_status "TypeScript compilation successful"
else
    echo "⚠️  TypeScript compilation has issues (check with: npx tsc --noEmit)"
    echo "   This is non-critical but should be addressed"
fi

# All checks passed
echo
echo "🎉 ALL PRE-TEST CHECKS PASSED!"
echo "================================"
echo "✅ Environment is ready for testing"
echo "✅ Database connection verified"
echo "✅ Configuration files valid"
echo
echo "📝 You can now safely run:"
echo "   npm run dev         # Start development server"
echo "   npm run test-db     # Detailed database tests"
echo "   npm run qr          # Generate QR for mobile testing"
echo
echo "📚 For troubleshooting, see:"
echo "   docs/working-configs/environment-setup.md"
echo "   docs/FINAL_STATUS_REPORT.md"
echo
