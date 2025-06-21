#!/bin/bash

# Script to check all TypeScript files for common issues
# Usage: ./fix-typescript-issues.sh

# Colors for better visibility
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Checking and Fixing TypeScript Files ===${NC}"

# Check for any remaining .js files in src
echo -e "${YELLOW}Checking for JavaScript files that should be converted...${NC}"
JS_FILES=$(find ./src -name "*.js" | grep -v "node_modules" | grep -v ".test.js" | grep -v ".spec.js")

if [ -n "$JS_FILES" ]; then
  echo -e "${RED}Found JavaScript files that should be converted to TypeScript:${NC}"
  echo "$JS_FILES"
  echo ""
  echo -e "${YELLOW}You can convert them using:${NC}"
  echo "./convert-to-typescript.sh"
else
  echo -e "${GREEN}✓ No JavaScript files found in src directory${NC}"
fi

# Check for 'any' types that should be more specific
echo -e "\n${YELLOW}Checking for 'any' types that should be more specific...${NC}"
ANY_TYPES=$(grep -r --include="*.ts" --include="*.tsx" ": any" ./src)

if [ -n "$ANY_TYPES" ]; then
  echo -e "${YELLOW}Found 'any' types that could be more specific:${NC}"
  echo "$ANY_TYPES"
else
  echo -e "${GREEN}✓ No explicit 'any' types found${NC}"
fi

# Check for implicit 'any' types
echo -e "\n${YELLOW}Running TypeScript compiler to check for implicit 'any' types...${NC}"
npx tsc --noEmit

# Add proper imports
echo -e "\n${YELLOW}Checking for common missing imports...${NC}"

# Check for files using useState without React import
USE_STATE_NO_REACT=$(grep -r --include="*.tsx" "useState" ./src | grep -v "import.*React")

if [ -n "$USE_STATE_NO_REACT" ]; then
  echo -e "${YELLOW}Found files using useState that might need React import:${NC}"
  echo "$USE_STATE_NO_REACT"
else
  echo -e "${GREEN}✓ No issues found with React imports${NC}"
fi

echo -e "\n${BLUE}=== TypeScript Check Complete ===${NC}"
echo "Review any issues listed above and fix them manually."
echo "Run './check-typescript.sh' to verify your fixes."
