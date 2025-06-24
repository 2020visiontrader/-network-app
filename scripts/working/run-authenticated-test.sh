#!/bin/bash

# Authenticated Test Runner
# This script ensures tests run with authentication
# for full database access

# Set up colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BLUE}${BOLD}🔐 AUTHENTICATED TEST RUNNER${NC}"
echo -e "${BLUE}============================${NC}"

# Check if test script was provided
if [ -z "$1" ]; then
  echo -e "${RED}❌ Error: No test script provided${NC}"
  echo -e "${YELLOW}Usage: $0 <test-script> [additional args]${NC}"
  echo -e "${YELLOW}Example: $0 scripts/working/test-database.js${NC}"
  exit 1
fi

TEST_SCRIPT=$1
shift # Remove the first argument, keeping the rest for passing to the test script

# Check if test script exists
if [ ! -f "$TEST_SCRIPT" ]; then
  echo -e "${RED}❌ Error: Test script '$TEST_SCRIPT' not found${NC}"
  exit 1
fi

# Check authentication status
echo -e "\n${BLUE}${BOLD}🔐 CHECKING AUTHENTICATION${NC}"
echo -e "${BLUE}==========================${NC}"
node scripts/working/auth-for-tests.js --status

# Check if authentication succeeded
AUTH_STATUS=$?
if [ $AUTH_STATUS -ne 0 ]; then
  echo -e "${YELLOW}⚠️ Authentication status check failed${NC}"
fi

# Check if we need to create a test user
if [[ "$*" == *"--create-test-user"* ]]; then
  echo -e "\n${BLUE}${BOLD}🔐 CREATING TEST USER${NC}"
  echo -e "${BLUE}======================${NC}"
  node scripts/working/auth-for-tests.js --create-test-user --auto-cleanup
  
  # Check if user creation succeeded
  if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to create test user${NC}"
    exit 1
  fi
fi

# Run pre-test cleanup with robust approach
echo -e "\n${BLUE}${BOLD}🧹 RUNNING PRE-TEST CLEANUP${NC}"
echo -e "${BLUE}==========================${NC}"
node scripts/working/robust-test-cleanup.js

# Force schema refresh with multiple strategies
echo -e "\n${BLUE}${BOLD}🔄 FORCING SCHEMA REFRESH${NC}"
echo -e "${BLUE}======================${NC}"

# Set an environment variable to mark schema version
export SCHEMA_VERSION=$(date +%s)
echo "Setting SCHEMA_VERSION=$SCHEMA_VERSION for this test run"

# Add a small delay to ensure schema changes have propagated
echo "Waiting for schema changes to propagate..."
sleep 2

# Run the actual test script with schema version environment variable
echo -e "\n${BLUE}${BOLD}🧪 RUNNING TEST: ${TEST_SCRIPT}${NC}"
echo -e "${BLUE}==========================${NC}"
SCHEMA_VERSION=$SCHEMA_VERSION node "$TEST_SCRIPT" "$@"
TEST_EXIT_CODE=$?

# Run post-test cleanup
echo -e "\n${BLUE}${BOLD}🧹 RUNNING POST-TEST CLEANUP${NC}"
echo -e "${BLUE}==========================${NC}"
node scripts/working/robust-test-cleanup.js

# Return the exit code from the test
if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo -e "\n${GREEN}${BOLD}✅ TEST COMPLETED SUCCESSFULLY${NC}"
else
  echo -e "\n${RED}${BOLD}❌ TEST FAILED WITH EXIT CODE ${TEST_EXIT_CODE}${NC}"
fi

exit $TEST_EXIT_CODE
