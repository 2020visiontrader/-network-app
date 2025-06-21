#!/bin/bash

# Find all TypeScript files in the src directory
find ./src -type f -name "*.ts" -o -name "*.tsx" | while read -r file; do
  # For each TypeScript file, check if it imports any *_backup files
  grep -l "_backup" "$file" | grep -v "_backup\." | while read -r match; do
    echo "File $match imports from a backup file"
    grep -n "_backup" "$match"
  done
done
