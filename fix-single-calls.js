#!/usr/bin/env node

// Script to replace all remaining .maybeSingle() with .maybeSingle() in API routes
const fs = require('fs');
const path = require('path');

const filesToFix = [
  'app/api/user/route.ts',
  'app/api/contacts/[id]/route.ts', 
  'app/api/contacts/route.ts',
  'app/api/coffee-chats/status/route.ts'
];

console.log('🔧 Fixing remaining .maybeSingle() calls in API routes...\n');

filesToFix.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (fs.existsSync(fullPath)) {
    try {
      let content = fs.readFileSync(fullPath, 'utf8');
      const originalContent = content;
      
      // Replace .maybeSingle() with .maybeSingle()
      content = content.replace(/\.single\(\)/g, '.maybeSingle()');
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
        console.log(`✅ Fixed: ${filePath}`);
      } else {
        console.log(`⚪ No changes needed: ${filePath}`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  } else {
    console.log(`⚠️  File not found: ${filePath}`);
  }
});

console.log('\n🎉 All .maybeSingle() calls have been replaced with .maybeSingle()!');
