// Helper script to find and fix potential undefined property access issues

const fs = require('fs');
const path = require('path');

// Define the patterns to look for
const patterns = [
  /\.href(?!\s*\?)/g,  // Match .href not followed by ? (optional chaining)
  /\.url(?!\s*\?)/g,   // Match .url not followed by ?
  /\.uri(?!\s*\?)/g,   // Match .uri not followed by ?
  /\.src(?!\s*\?)/g    // Match .src not followed by ?
];

// Define directory to scan (excluding node_modules)
const ROOT_DIR = path.resolve(__dirname, './src');

// Track found issues
const issues = [];

// Recursive function to scan directory
function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      // Skip node_modules and .git directories
      if (file !== 'node_modules' && file !== '.git') {
        scanDirectory(filePath);
      }
    } else if (stats.isFile() && 
              (file.endsWith('.js') || file.endsWith('.jsx') || 
               file.endsWith('.ts') || file.endsWith('.tsx'))) {
      // Read file content
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for patterns
      let hasIssue = false;
      let lineNumber = 0;
      const lines = content.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        for (const pattern of patterns) {
          if (pattern.test(line)) {
            hasIssue = true;
            issues.push({
              file: filePath,
              line: i + 1,
              content: line.trim(),
              suggestion: line.trim().replace(pattern, match => `?${match}`)
            });
          }
        }
      }
    }
  }
}

// Start scanning
console.log('🔍 Scanning for potential undefined property access issues...');
try {
  scanDirectory(ROOT_DIR);
  
  if (issues.length === 0) {
    console.log('✅ No potential issues found!');
  } else {
    console.log(`⚠️ Found ${issues.length} potential issues:`);
    
    for (const issue of issues) {
      console.log(`\nFile: ${issue.file}`);
      console.log(`Line: ${issue.line}`);
      console.log(`Code: ${issue.content}`);
      console.log(`Suggestion: ${issue.suggestion}`);
      
      // You could also automatically fix these issues with:
      // const filePath = issue.file;
      // let content = fs.readFileSync(filePath, 'utf8');
      // const lines = content.split('\n');
      // lines[issue.line - 1] = issue.suggestion;
      // fs.writeFileSync(filePath, lines.join('\n'));
    }
    
    console.log('\nTo fix these issues:');
    console.log('1. Use optional chaining: object?.property');
    console.log('2. Add defensive checks: if (object && object.property)');
    console.log('3. Provide default values: object?.property || defaultValue');
  }
} catch (error) {
  console.error('Error scanning files:', error);
}
