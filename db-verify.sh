#!/bin/bash
# db-verify.sh
# A script to verify database connection and setup before running tests

# Text colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}     NETWORK FOUNDER APP - DATABASE VERIFICATION   ${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""

# 1. Check if required environment variables are set
echo -e "${YELLOW}Checking environment variables...${NC}"
if [ -z "$EXPO_PUBLIC_SUPABASE_URL" ] || [ -z "$EXPO_PUBLIC_SUPABASE_ANON_KEY" ]; then
  echo -e "${RED}Error: Missing required environment variables${NC}"
  echo -e "Please ensure these variables are set in your .env file:"
  echo -e "  - EXPO_PUBLIC_SUPABASE_URL"
  echo -e "  - EXPO_PUBLIC_SUPABASE_ANON_KEY"
  echo ""
  echo -e "Run: ${YELLOW}cp .env.example .env${NC} and fill in the values"
  exit 1
else
  echo -e "${GREEN}✓ Environment variables are set${NC}"
fi

# 2. Run the database verification script
echo -e "\n${YELLOW}Running database verification...${NC}"
node pre-test-db-verification.js

# Check if verification was successful
if [ $? -ne 0 ]; then
  echo -e "\n${RED}Database verification failed.${NC}"
  echo -e "Please address the issues before running tests."
  echo -e "Recommended steps:"
  echo -e "  1. Run fix-schema-cache-complete.sql in Supabase SQL Editor"
  echo -e "  2. Run enhanced-rls-enforcement.sql in Supabase SQL Editor"
  echo -e "  3. Run this verification again"
  exit 1
fi

echo -e "\n${GREEN}Database verification completed successfully.${NC}"
echo -e "You can now proceed with running tests."
echo -e "${BLUE}==================================================${NC}"
echo ""

# Offer to run comprehensive verification
echo -e "Would you like to run a comprehensive RLS verification? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
  echo -e "\n${YELLOW}Running comprehensive RLS verification...${NC}"
  node ultimate-rls-verification.js
fi

echo -e "\n${GREEN}All checks completed.${NC}"
