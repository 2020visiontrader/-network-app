#!/bin/bash

# Script to check for TypeScript errors in the project
# Usage: ./check-typescript.sh

# Colors for better visibility
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Checking TypeScript Types ===${NC}"
echo "This may take a moment..."

# Run TypeScript compiler in check mode (no emit)
npx tsc --noEmit

# Check the exit code
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ No TypeScript errors found${NC}"
else
  echo -e "${RED}✗ TypeScript errors found${NC}"
  echo -e "${YELLOW}Fix the errors above to ensure your TypeScript code is valid.${NC}"
  echo -e "${YELLOW}See TYPESCRIPT_GUIDE.md for help with common errors.${NC}"
fi
