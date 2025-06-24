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
