/**
 * Find .single() Calls Helper
 * 
 * This script helps identify files that might contain .single() calls
 * that should be replaced with .maybeSingle()
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Directory to search
const rootDir = process.cwd();

// Extensions to search
const extensions = ['.js', '.jsx', '.ts', '.tsx'];

console.log('🔍 SEARCHING FOR .single() CALLS');
console.log('==============================');

// Create the fix script for individual files
function createFixScript() {
  const fixScriptContent = `/**
 * Fix Single Call in Specific File
 * 
 * Usage: node fix-single-call.js <filepath>
 */

const fs = require('fs');
const path = require('path');

// Get the filepath from command line arguments
const filepath = process.argv[2];

if (!filepath) {
  console.error('❌ Please provide a filepath');
  console.error('Usage: node fix-single-call.js <filepath>');
  process.exit(1);
}

// Check if file exists
if (!fs.existsSync(filepath)) {
  console.error(\`❌ File not found: \${filepath}\`);
  process.exit(1);
}

console.log(\`📄 Processing file: \${filepath}\`);

// Read the file
let content = fs.readFileSync(filepath, 'utf8');

// Count occurrences before replacement
const beforeCount = (content.match(/\\.single\\(\\)/g) || []).length;

if (beforeCount === 0) {
  console.log('✅ No .single() calls found in this file');
  process.exit(0);
}

// Replace .single() with .maybeSingle()
content = content.replace(/\\.single\\(\\)/g, '.maybeSingle()');

// Count occurrences after replacement
const afterCount = (content.match(/\\.maybeSingle\\(\\)/g) || []).length;

// Create backup
fs.writeFileSync(\`\${filepath}.bak\`, fs.readFileSync(filepath));
console.log(\`📦 Created backup: \${filepath}.bak\`);

// Write the updated content
fs.writeFileSync(filepath, content);

console.log(\`✅ Updated \${beforeCount} occurrences of .single() to .maybeSingle()\`);
console.log('⚠️ IMPORTANT: You may need to update error handling to check for null data');
console.log(\`
// Add checks for null data:
if (error) {
  // Handle database errors
} else if (data === null) {
  // Handle not found condition
} else {
  // Process data
}
\`);
`;

  fs.writeFileSync('fix-single-call.js', fixScriptContent);
  console.log('✅ Created fix-single-call.js script');
}

// Use grep to find .single() calls
exec(`grep -r "\\.single()" --include="*.{js,jsx,ts,tsx}" ${rootDir}`, (error, stdout, stderr) => {
  if (error && error.code !== 1) { // grep returns 1 when no matches found
    console.log('❌ Error searching for .single() calls:', error.message);
    return;
  }
  
  if (stderr) {
    console.log('⚠️ Grep stderr:', stderr);
  }
  
  if (!stdout) {
    console.log('✅ No .single() calls found! Your codebase is clean.');
    return;
  }
  
  // Process the results
  const lines = stdout.split('\n').filter(line => line.trim() !== '');
  
  console.log(`Found ${lines.length} potential .single() calls to replace:`);
  console.log('----------------------------------------');
  
  lines.forEach((line, index) => {
    const parts = line.split(':');
    const filePath = parts[0];
    const lineContent = parts.slice(1).join(':');
    
    console.log(`${index + 1}. File: ${filePath}`);
    console.log(`   Line: ${lineContent.trim()}`);
    console.log(`   Replace with: ${lineContent.trim().replace('.single()', '.maybeSingle()')}`);
    console.log('----------------------------------------');
  });
  
  console.log('\n📋 NEXT STEPS:');
  console.log('1. Review each instance above');
  console.log('2. Replace .single() with .maybeSingle()');
  console.log('3. Update error handling to handle null results');
  console.log('\nExample error handling with .maybeSingle():');
  console.log('```javascript');
  console.log('const { data, error } = await supabase');
  console.log('  .from("founders")');
  console.log('  .select("*")');
  console.log('  .eq("user_id", userId)');
  console.log('  .maybeSingle();');
  console.log('  ');
  console.log('if (error) {');
  console.log('  // Handle query error');
  console.log('} else if (data === null) {');
  console.log('  // Handle case where no record was found');
  console.log('} else {');
  console.log('  // Process the data');
  console.log('}');
  console.log('```');

  // Create the fix script
  createFixScript();
  
  console.log('\n⚙️ AUTOMATIC FIX:');
  console.log('To automatically fix a specific file, run:');
  console.log('node fix-single-call.js <filepath>');
});
