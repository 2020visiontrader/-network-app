#!/bin/bash
# check-runtime.sh
# Script to help find and fix runtime errors in the TypeScript codebase

echo "=== Checking for Potential Runtime Errors ==="

# Check for common runtime issues
echo "🔍 Checking for null/undefined access patterns..."
grep -r "\\?\\." --include="*.ts" --include="*.tsx" src || echo "✅ No optional chaining found, consider adding where appropriate."

echo "🔍 Checking for any/unknown types that might cause runtime issues..."
grep -r ": any" --include="*.ts" --include="*.tsx" src

echo "🔍 Checking for non-null assertions (!.)..."
grep -r "\\!\\." --include="*.ts" --include="*.tsx" src || echo "✅ No non-null assertions found."

echo "🔍 Checking for type assertions..."
grep -r "as " --include="*.ts" --include="*.tsx" src || echo "✅ No type assertions found."

echo "🔍 Checking for undefined state variables in React components..."
grep -r "useState()" --include="*.tsx" src || echo "✅ No undefined state variables found."

echo "===== Runtime Check Complete ====="
echo "Review the findings above to identify potential runtime issues."
echo "Consider adding more specific types and safer access patterns where needed."
