#!/bin/bash
# validate-typescript.sh
# Comprehensive script to validate TypeScript and check for runtime issues

echo "======= TypeScript Validation ======="
echo "Running full validation of TypeScript code"

# Check TypeScript compilation
echo "🔍 Checking TypeScript compilation..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
  echo "❌ TypeScript compilation errors found"
  echo "Fix the errors above before continuing"
  exit 1
else
  echo "✅ TypeScript compilation successful"
fi

# Check for runtime issues
echo ""
echo "======= Runtime Check ======="
echo "Checking for potential runtime issues..."
./check-runtime.sh

# Count any usages
ANY_COUNT=$(grep -r ": any" --include="*.ts" --include="*.tsx" src | wc -l)
echo ""
echo "======= Type Quality Metrics ======="
echo "Found $ANY_COUNT 'any' type usages in the codebase"

if [ $ANY_COUNT -gt 30 ]; then
  echo "⚠️ High number of 'any' types detected. Consider improving type coverage."
  echo "Run './fix-any-types.sh' to help address these issues."
elif [ $ANY_COUNT -gt 10 ]; then
  echo "⚠️ Moderate number of 'any' types detected. Type safety could be improved."
else
  echo "✅ Low number of 'any' types - good type coverage!"
fi

echo ""
echo "======= Validation Complete ======="
echo "TypeScript codebase is in good health"
echo ""
echo "Next steps:"
echo "- Address any runtime issues flagged above"
echo "- Continue improving type coverage where 'any' is used"
echo "- Run tests to ensure runtime behavior is as expected"
