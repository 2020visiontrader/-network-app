#!/bin/bash
# Script to find all .single() instances in the codebase

echo "🔍 Searching for .single() instances that should be replaced with .maybeSingle()"
echo "====================================================================="

# Search in TypeScript files
echo "TypeScript files (.ts, .tsx):"
echo "----------------------------"
grep -r "\.single()" --include="*.ts" --include="*.tsx" ./src | sort

# Search in JavaScript files
echo -e "\nJavaScript files (.js, .jsx):"
echo "-----------------------------"
grep -r "\.single()" --include="*.js" --include="*.jsx" ./src | sort

# Search in test files
echo -e "\nTest files (.js):"
echo "---------------"
grep -r "\.single()" --include="*.js" ./ --exclude-dir="node_modules" --exclude-dir="src" | sort

# Count total occurrences
TOTAL=$(grep -r "\.single()" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" ./ --exclude-dir="node_modules" | wc -l)

echo -e "\n🔍 Found $TOTAL occurrences of .single()"
echo "Replace each instance with .maybeSingle() and update error handling"
echo ""
echo "📋 RECOMMENDED PATTERN:"
echo "const { data, error } = await supabase"
echo "  .from('table')"
echo "  .select('*')"
echo "  .eq('column', value)"
echo "  .maybeSingle(); // ✅ Returns null if not found, no error"
echo ""
echo "if (error) {"
echo "  // Handle database errors"
echo "} else if (data === null) {"
echo "  // Handle not found condition"
echo "} else {"
echo "  // Process the data"
echo "}"

# Create a replacement script
cat > replace-single-with-maybeSingle.sh << 'EOF'
#!/bin/bash
# Script to replace .single() with .maybeSingle() in a specific file

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <file_path>"
    exit 1
fi

FILE=$1

if [ ! -f "$FILE" ]; then
    echo "File not found: $FILE"
    exit 1
fi

echo "📝 Replacing .single() with .maybeSingle() in $FILE"

# Create backup
cp "$FILE" "${FILE}.bak"

# Replace .single() with .maybeSingle()
sed -i '' 's/\.single()/\.maybeSingle()/g' "$FILE"

echo "✅ Replacement complete. Backup saved as ${FILE}.bak"
echo "⚠️ Important: You may need to update error handling logic to check for null data"
EOF

chmod +x replace-single-with-maybeSingle.sh

echo -e "\n✅ Created replacement script: replace-single-with-maybeSingle.sh"
echo "Usage: ./replace-single-with-maybeSingle.sh <file_path>"
