#!/bin/bash
# Test the onboarding flow in the Expo app

# Set colors for console output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================================${NC}"
echo -e "${BLUE}     NETWORK APP ONBOARDING FLOW TEST                 ${NC}"
echo -e "${BLUE}=======================================================${NC}"

# Change to the app directory
cd /Users/BrandonChi/Desktop/NETWORK\ APP/NetworkFounderApp

# 1. Check if database migrations have been applied
echo -e "\n${YELLOW}Checking database configuration...${NC}"
echo "This step should be completed in Supabase Dashboard > SQL Editor"
echo "using the verification scripts we created."

# 2. Verify key files are properly updated
echo -e "\n${YELLOW}Verifying app files...${NC}"

# Check FormValidator.js for improved LinkedIn validation
if grep -q "^https:\/\/(www\.)?linkedin\.com\/.+$/i" src/utils/FormValidator.js; then
  echo -e "${GREEN}✓${NC} FormValidator.js has improved LinkedIn validation"
else
  echo -e "${RED}✗${NC} FormValidator.js may need LinkedIn validation update"
fi

# Check OnboardingForm.js for proper field handling
if grep -q "upsertFounderOnboarding" src/components/OnboardingForm.js; then
  echo -e "${GREEN}✓${NC} OnboardingForm.js uses upsertFounderOnboarding method"
else
  echo -e "${RED}✗${NC} OnboardingForm.js may need upsertFounderOnboarding implementation"
fi

# Check FounderService.js for retry logic
if grep -q "maybeSingle" src/services/FounderService.js; then
  echo -e "${GREEN}✓${NC} FounderService.js uses maybeSingle() for safe queries"
else
  echo -e "${RED}✗${NC} FounderService.js may need maybeSingle() implementation"
fi

# 3. Offer to start the Expo development server
echo -e "\n${YELLOW}Ready to start the Expo development server?${NC}"
echo "This will launch the app for testing the onboarding flow."
read -p "Start Expo server? (y/n): " start_expo

if [[ $start_expo == "y" || $start_expo == "Y" ]]; then
  echo -e "\n${BLUE}Starting Expo development server...${NC}"
  echo -e "${BLUE}=======================================================${NC}"
  echo -e "${YELLOW}TESTING INSTRUCTIONS:${NC}"
  echo "1. Sign up or log in with a test account"
  echo "2. Complete the onboarding form with all required fields"
  echo "3. Verify you're redirected to the dashboard after onboarding"
  echo "4. Try logging out and back in to verify onboarding persistence"
  echo -e "${BLUE}=======================================================${NC}"
  
  # Start Expo
  npx expo start
else
  echo -e "\n${YELLOW}Skipping Expo server startup.${NC}"
  echo "Run 'npx expo start' manually when you're ready to test."
fi

echo -e "\n${BLUE}=======================================================${NC}"
echo -e "${BLUE}     TEST COMPLETE                                     ${NC}"
echo -e "${BLUE}=======================================================${NC}"
