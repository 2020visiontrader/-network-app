#!/bin/bash

# Safe Test Runner with Cleanup
# This script runs tests with proper cleanup before and after
# to prevent stale data and schema cache issues

# Set up colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BLUE}${BOLD}📋 SAFE TEST RUNNER WITH CLEANUP${NC}"
echo -e "${BLUE}===============================${NC}"

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

# Run pre-test cleanup with permission-friendly approach
echo -e "\n${BLUE}${BOLD}🧹 RUNNING PRE-TEST SETUP${NC}"
echo -e "${BLUE}=========================${NC}"
node scripts/working/permission-friendly-test.js

# Check if setup succeeded
if [ $? -ne 0 ]; then
  echo -e "${YELLOW}⚠️ Warning: Pre-test setup had issues, continuing anyway...${NC}"
fi

# Force schema refresh with env var approach
echo -e "\n${BLUE}${BOLD}🔄 FORCING CLIENT SCHEMA REFRESH${NC}"
echo -e "${BLUE}=============================${NC}"

# Set an environment variable to mark schema version
export SCHEMA_VERSION=$(date +%s)
echo "Setting SCHEMA_VERSION=$SCHEMA_VERSION for this test run"

# Add a small delay to ensure schema changes have propagated
echo "Waiting for schema changes to propagate..."
sleep 2

# Run the actual test script
echo -e "\n${BLUE}${BOLD}🧪 RUNNING TEST: ${TEST_SCRIPT}${NC}"
echo -e "${BLUE}==========================${NC}"
SCHEMA_VERSION=$SCHEMA_VERSION node "$TEST_SCRIPT" "$@"
TEST_EXIT_CODE=$?

# Run post-test cleanup
echo -e "\n${BLUE}${BOLD}🧹 RUNNING POST-TEST CLEANUP${NC}"
echo -e "${BLUE}==========================${NC}"
node scripts/working/permission-friendly-test.js

# Return the exit code from the test
if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo -e "\n${GREEN}${BOLD}✅ TEST COMPLETED SUCCESSFULLY${NC}"
else
  echo -e "\n${RED}${BOLD}❌ TEST FAILED WITH EXIT CODE ${TEST_EXIT_CODE}${NC}"
fi

exit $TEST_EXIT_CODE
