#!/bin/bash

# Script to convert JavaScript files to TypeScript
# Usage: ./convert-to-typescript.sh

# Colors for better visibility
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Converting JavaScript to TypeScript ===${NC}"

# Convert React component files (.js -> .tsx)
echo -e "${YELLOW}Converting React component files (.js -> .tsx)...${NC}"
for file in $(find ./src -name "*.js" | grep -v "node_modules" | grep -v ".test.js" | grep -v ".spec.js"); do
  if grep -q "React" "$file" || grep -q "import.*from 'react'" "$file" || grep -q "import.*from \"react\"" "$file"; then
    newfile="${file%.js}.tsx"
    echo "Converting React component: $file -> $newfile"
    # Create a backup
    cp "$file" "${file}.backup"
    # Rename the file
    mv "$file" "$newfile"
  fi
done

# Convert other JavaScript files (.js -> .ts)
echo -e "${YELLOW}Converting other JavaScript files (.js -> .ts)...${NC}"
for file in $(find ./src -name "*.js" | grep -v "node_modules" | grep -v ".test.js" | grep -v ".spec.js"); do
  newfile="${file%.js}.ts"
  echo "Converting: $file -> $newfile"
  # Create a backup
  cp "$file" "${file}.backup"
  # Rename the file
  mv "$file" "$newfile"
done

# Convert the root App.js file
if [ -f "./App.js" ]; then
  echo -e "${YELLOW}Converting root App.js file...${NC}"
  cp "./App.js" "./App.js.backup"
  mv "./App.js" "./App.tsx"
fi

# Convert index.js
if [ -f "./index.js" ]; then
  echo -e "${YELLOW}Converting root index.js file...${NC}"
  cp "./index.js" "./index.js.backup"
  mv "./index.js" "./index.ts"
fi

echo -e "${GREEN}Conversion complete!${NC}"
echo ""
echo -e "${YELLOW}You may need to manually add type annotations to your files.${NC}"
echo -e "${YELLOW}Check for any type errors by running: npx tsc --noEmit${NC}"
