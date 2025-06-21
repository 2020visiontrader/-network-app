#!/bin/bash

echo "JavaScript files that should be TypeScript:"
find ./src -type f -name "*.js" -not -path "./node_modules/*" | grep -v "_backup.js" | grep -v "_fixed.js" | grep -v "_old.js" | grep -v "_new.js"

echo -e "\nChecking TypeScript file paths consistency..."
# Find TypeScript files that have a .js counterpart
find ./src -type f -name "*.ts" -o -name "*.tsx" | while read -r tsfile; do
  jsfile="${tsfile%.*}.js"
  if [ -f "$jsfile" ]; then
    echo "Warning: Both TypeScript and JavaScript versions exist: $tsfile and $jsfile"
  fi
done
