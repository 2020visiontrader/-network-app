#!/bin/bash

# Auth & Test Runner - Combines authentication and test execution
# =============================================================

echo "🔐 AUTHENTICATING AND RUNNING TESTS"
echo "=================================="

# Check if email and password are provided
if [ "$#" -lt 3 ]; then
  echo "❌ Missing arguments"
  echo "Usage: ./auth-and-test.sh <email> <password> <test-script> [additional args]"
  echo "Example: ./auth-and-test.sh user@example.com mypassword scripts/working/test-database.js"
  exit 1
fi

EMAIL="$1"
PASSWORD="$2"
TEST_SCRIPT="$3"
shift 3  # Remove the first three arguments

# Authenticate first
echo "🔑 Authenticating as $EMAIL..."

# Use auth-for-tests.js if it exists, otherwise use a simpler approach
if [ -f "./scripts/working/auth-for-tests.js" ]; then
  node ./scripts/working/auth-for-tests.js login --email="$EMAIL" --password="$PASSWORD"
  AUTH_RESULT=$?
elif [ -f "./scripts/working/test-auth.js" ]; then
  node ./scripts/working/test-auth.js login --email="$EMAIL" --password="$PASSWORD"
  AUTH_RESULT=$?
else
  echo "❌ Authentication scripts not found"
  exit 1
fi

# Check if authentication was successful
if [ $AUTH_RESULT -ne 0 ]; then
  echo "❌ Authentication failed"
  exit 1
fi

echo "✅ Authentication successful"

# Run the test script
echo ""
echo "🧪 RUNNING TEST: $TEST_SCRIPT"
echo "=========================="

if [ -f "./scripts/working/run-authenticated-test.sh" ]; then
  # Use the existing authenticated test runner
  ./scripts/working/run-authenticated-test.sh "$TEST_SCRIPT" "$@"
else
  # Fallback to running the script directly
  node "$TEST_SCRIPT" "$@"
fi

# Capture the test result
TEST_RESULT=$?

# Optional: Log out after test
# Uncomment if you want to automatically log out after testing
# echo ""
# echo "🔒 LOGGING OUT"
# echo "============="
# node ./scripts/working/auth-for-tests.js logout

# Return the test result
exit $TEST_RESULT
