/**
 * UUID Test Fix Utility
 * 
 * This script fixes all test files that use invalid UUID formats
 * by replacing them with proper UUID v4 generation.
 */
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

// Check if uuid package is installed
async function ensureUuidInstalled() {
  try {
    require('uuid');
    console.log('✅ UUID package already installed');
  } catch (err) {
    console.log('🔄 Installing uuid package...');
    await exec('npm install uuid');
    console.log('✅ UUID package installed');
  }
}

// Find all test files
async function findTestFiles() {
  return new Promise((resolve, reject) => {
    glob('**/*.{js,ts}', { ignore: 'node_modules/**' }, (err, files) => {
      if (err) return reject(err);
      resolve(files);
    });
  });
}

// Check file for invalid UUID patterns
function checkFileForInvalidUuids(filePath, content) {
  const invalidPatterns = [
    // ID patterns that create invalid UUIDs
    /id:\s*[`"']test-\${Date\.now\(\)}-/,
    /id:\s*[`"']test-[^`"']*[`"']/,
    /const\s+testUUID\s*=\s*[`"']test-/,
    /testId\s*=\s*[`"']test-/,
    /userId\s*=\s*[`"']test-/
  ];
  
  let hasInvalidPattern = false;
  
  for (const pattern of invalidPatterns) {
    if (pattern.test(content)) {
      hasInvalidPattern = true;
      break;
    }
  }
  
  return hasInvalidPattern;
}

// Add UUID import if needed
function addUuidImport(content) {
  // Check if uuid is already imported
  if (/import.*uuid/.test(content) || /require\(['"']uuid['"']\)/.test(content)) {
    return content;
  }
  
  // Add import based on module type
  if (content.includes('import ') || content.includes('export ')) {
    // ES module syntax
    return `import { v4 as uuidv4 } from 'uuid';\n${content}`;
  } else {
    // CommonJS syntax
    return `const { v4: uuidv4 } = require('uuid');\n${content}`;
  }
}

// Fix invalid UUID patterns in file
function fixInvalidUuids(content) {
  // Replace invalid ID patterns with proper UUID generation
  let fixed = content
    // Fix direct test ID assignments
    .replace(/id:\s*[`"']test-\${Date\.now\(\)}-[^`"']*[`"']/g, 'id: uuidv4()')
    .replace(/id:\s*[`"']test-[^`"']*[`"']/g, 'id: uuidv4()')
    // Fix test UUID variables
    .replace(/const\s+testUUID\s*=\s*[`"']test-[^`"']*[`"']/g, 'const testUUID = uuidv4()')
    .replace(/let\s+testUUID\s*=\s*[`"']test-[^`"']*[`"']/g, 'let testUUID = uuidv4()')
    // Fix test ID variables
    .replace(/const\s+testId\s*=\s*[`"']test-[^`"']*[`"']/g, 'const testId = uuidv4()')
    .replace(/let\s+testId\s*=\s*[`"']test-[^`"']*[`"']/g, 'let testId = uuidv4()')
    // Fix user ID variables
    .replace(/const\s+userId\s*=\s*[`"']test-[^`"']*[`"']/g, 'const userId = uuidv4()')
    .replace(/let\s+userId\s*=\s*[`"']test-[^`"']*[`"']/g, 'let userId = uuidv4()');
  
  return fixed;
}

async function main() {
  try {
    console.log('🔍 Starting UUID Test Fix Utility');
    
    // Ensure uuid package is installed
    await ensureUuidInstalled();
    
    // Find all test files
    const files = await findTestFiles();
    console.log(`Found ${files.length} files to check`);
    
    let fixedFiles = 0;
    
    // Process each file
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check if file contains invalid UUID patterns
      if (checkFileForInvalidUuids(file, content)) {
        console.log(`📝 Fixing invalid UUIDs in: ${file}`);
        
        // Add UUID import if needed
        let fixedContent = addUuidImport(content);
        
        // Fix invalid UUID patterns
        fixedContent = fixInvalidUuids(fixedContent);
        
        // Write fixed content back to file
        fs.writeFileSync(file, fixedContent, 'utf8');
        
        fixedFiles++;
      }
    }
    
    console.log(`\n✅ UUID Fix Complete: Fixed ${fixedFiles} files`);
    console.log('All test user IDs now use proper UUID v4 format\n');
    
    console.log('🔧 Next steps:');
    console.log('1. Run your tests to verify the fixes');
    console.log('2. Check for any remaining UUID format errors');
    console.log('3. If needed, run this utility again to catch any missed patterns');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
main();
