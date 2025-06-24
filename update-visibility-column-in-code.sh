#!/bin/bash
# Script to update all code to use profile_visible instead of is_visible

echo "🔧 Updating code to standardize on profile_visible column..."

# Find and update TypeScript/JavaScript files
echo "Searching for TypeScript/JavaScript files with is_visible..."

# Update .ts files
grep -l "is_visible" --include="*.ts" -r ./src | while read file; do
  echo "Updating $file"
  sed -i '' 's/is_visible/profile_visible/g' "$file"
done

# Update .tsx files
grep -l "is_visible" --include="*.tsx" -r ./src | while read file; do
  echo "Updating $file"
  sed -i '' 's/is_visible/profile_visible/g' "$file"
done

# Update .js files
grep -l "is_visible" --include="*.js" -r ./src | while read file; do
  echo "Updating $file"
  sed -i '' 's/is_visible/profile_visible/g' "$file"
done

# Update test files
grep -l "is_visible" --include="*.js" -r ./ --exclude-dir="node_modules" --exclude-dir="src" | while read file; do
  echo "Updating $file"
  sed -i '' 's/is_visible/profile_visible/g' "$file"
done

echo "✅ Code update complete!"
echo "Next steps:"
echo "1. Run fix-visibility-column-mismatch.sql in the Supabase dashboard"
echo "2. Run test-authenticated-rls.js to verify the fix"
