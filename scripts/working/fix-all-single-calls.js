#!/usr/bin/env node

/**
 * Complete .maybeSingle() to .maybeSingle() Migration Script
 * 
 * This script finds and fixes ALL remaining .maybeSingle() calls in the project
 * to prevent PGRST116 errors and ensure safe database operations.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 COMPLETE .maybeSingle() → .maybeSingle() MIGRATION\n');
console.log('🎯 Target: Eliminate ALL PGRST116 errors');
console.log('📋 Strategy: Replace .maybeSingle() with .maybeSingle() + null checks\n');

// Directories to scan (excluding node_modules, .git, etc.)
const scanDirs = [
  'src',
  'app', 
  'scripts',
  'docs',
  '.'  // Root level files
];

// File patterns to include
const includePatterns = [
  '*.js',
  '*.ts', 
  '*.tsx',
  '*.jsx'
];

// Files to exclude (backup files, generated files, etc.)
const excludePatterns = [
  'node_modules',
  '.git',
  '.expo',
  '.next',
  'dist',
  'build',
  '*.backup',
  'package-lock.json'
];

function findAllSingleCalls() {
  console.log('🔍 Scanning for remaining .maybeSingle() calls...\n');
  
  let totalFound = 0;
  const fileMatches = [];
  
  try {
    // Use grep to find all .maybeSingle() occurrences
    const grepCommand = `grep -r --include="*.js" --include="*.ts" --include="*.tsx" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.expo --exclude="*.backup" "\\.maybeSingle()" .`;
    
    const result = execSync(grepCommand, { encoding: 'utf8' });
    const lines = result.trim().split('\n');
    
    lines.forEach(line => {
      if (line.trim()) {
        const [filePath, ...rest] = line.split(':');
        const content = rest.join(':').trim();
        
        // Skip documentation and comment lines
        if (!content.includes('//') && !content.includes('*') && !content.includes('```')) {
          fileMatches.push({
            file: filePath,
            line: content,
            fullMatch: line
          });
          totalFound++;
        }
      }
    });
    
  } catch (error) {
    if (error.status === 1) {
      console.log('✅ No .maybeSingle() calls found in source code!');
      return [];
    } else {
      console.error('❌ Error running grep:', error.message);
      return [];
    }
  }
  
  if (totalFound > 0) {
    console.log(`📊 Found ${totalFound} .maybeSingle() calls in source files:\n`);
    
    fileMatches.forEach((match, index) => {
      console.log(`${index + 1}. ${match.file}`);
      console.log(`   ${match.line}`);
      console.log('');
    });
  }
  
  return fileMatches;
}

function fixSingleCall(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changesMade = 0;
    
    // Replace .maybeSingle() with .maybeSingle()
    const originalContent = content;
    content = content.replace(/\.single\(\)/g, '.maybeSingle()');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      changesMade = (originalContent.match(/\.single\(\)/g) || []).length;
      console.log(`✅ Fixed ${changesMade} .maybeSingle() call(s) in ${filePath}`);
    }
    
    return changesMade;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return 0;
  }
}

function validateFixes() {
  console.log('\n🔍 Validating fixes...');
  
  // Check for any remaining .maybeSingle() calls
  try {
    const grepCommand = `grep -r --include="*.js" --include="*.ts" --include="*.tsx" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.expo --exclude="*.backup" "\\.maybeSingle()" . | grep -v "//.*\\.maybeSingle()" | grep -v "\\*.*\\.maybeSingle()" | grep -v "\`\`\`"`;
    
    const result = execSync(grepCommand, { encoding: 'utf8' });
    
    if (result.trim()) {
      console.log('⚠️ Found remaining .maybeSingle() calls:');
      console.log(result);
      return false;
    }
  } catch (error) {
    if (error.status === 1) {
      console.log('✅ No remaining .maybeSingle() calls found!');
      return true;
    }
  }
  
  return true;
}

function generateErrorHandlingGuide() {
  const guide = `# PGRST116 Error Prevention Guide

## ✅ SAFE PATTERN: Use .maybeSingle()

\`\`\`typescript
// ✅ CORRECT: Safe for 0 or 1 rows
const { data: founder, error } = await supabase
  .from('founders')
  .select('*')
  .eq('user_id', userId)
  .maybeSingle();

if (error) {
  console.error('Database error:', error);
  return;
}

if (!founder) {
  console.log('No founder found - this is safe');
  return;
}

// founder exists, proceed safely
console.log('Found founder:', founder.full_name);
\`\`\`

## ❌ AVOID: .maybeSingle() throws PGRST116

\`\`\`typescript
// ❌ DANGEROUS: Throws if 0 rows or >1 rows
const { data: founder, error } = await supabase
  .from('founders')
  .select('*')
  .eq('user_id', userId)
  .maybeSingle(); // THROWS PGRST116 if no rows!
\`\`\`

## 🔄 ALTERNATIVE: .limit(1) + manual check

\`\`\`typescript
// ✅ ALTERNATIVE: Manual limit + array check
const { data, error } = await supabase
  .from('founders')
  .select('*')
  .eq('user_id', userId)
  .limit(1);

const founder = data?.[0] || null;
\`\`\`

## 🛡️ Error Handling Best Practices

1. **Always check for error first**
2. **Always check for null/undefined data**
3. **Use .maybeSingle() for single-row expectations**
4. **Use .limit(1) + array access for manual control**
5. **Never use .maybeSingle() in production code**

Generated: ${new Date().toISOString()}
`;

  fs.writeFileSync('docs/solutions/pgrst116-prevention.md', guide);
  console.log('📝 Created error prevention guide: docs/solutions/pgrst116-prevention.md');
}

// Main execution
async function main() {
  // Step 1: Find all .maybeSingle() calls
  const matches = findAllSingleCalls();
  
  if (matches.length === 0) {
    console.log('🎉 No .maybeSingle() calls found to fix!');
    console.log('✅ All PGRST116 errors should be eliminated.\n');
    
    generateErrorHandlingGuide();
    return;
  }
  
  // Step 2: Fix each file
  console.log('🔧 Applying fixes...\n');
  let totalFixed = 0;
  
  const uniqueFiles = [...new Set(matches.map(m => m.file))];
  
  for (const filePath of uniqueFiles) {
    const fixed = fixSingleCall(filePath);
    totalFixed += fixed;
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Files processed: ${uniqueFiles.length}`);
  console.log(`   .maybeSingle() calls fixed: ${totalFixed}`);
  
  // Step 3: Validate fixes
  const isValid = validateFixes();
  
  if (isValid) {
    console.log('\n🎉 SUCCESS: All .maybeSingle() calls have been eliminated!');
    console.log('✅ PGRST116 errors should no longer occur.');
    
    generateErrorHandlingGuide();
  } else {
    console.log('\n⚠️ Some .maybeSingle() calls may still remain.');
    console.log('   Please review the output above and fix manually if needed.');
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Run tests: npm run test:database');
  console.log('2. Test onboarding flow: npm run qr');
  console.log('3. Verify mobile app: Expo Go scan');
  console.log('4. Check for any remaining PGRST116 errors in logs');
}

// Execute the script
main().catch(console.error);
