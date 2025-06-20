// Fix for "Cannot read property 'href' of undefined" error
// This script identifies potential undefined href access in your code

const fs = require('fs');
const path = require('path');
const util = require('util');
const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

// Configuration
const srcDir = path.join(__dirname, 'src');
const patterns = [
  // Patterns that might cause the "Cannot read property 'href' of undefined" error
  /([a-zA-Z0-9_\.]+)\.href/g,
  /([a-zA-Z0-9_\.]+)\.profile_url/g,
  /router\.push\(([^)]+)\)/g,
  /navigation\.navigate\(([^)]+)\)/g
];

async function findVulnerablePaths() {
  console.log('🔍 Scanning for potential undefined href access issues...');
  
  // Get all JS files recursively
  const jsFiles = await getAllJsFiles(srcDir);
  const issues = [];
  
  // Scan each file for potential issues
  for (const file of jsFiles) {
    const content = await readFile(file, 'utf8');
    let lineNumber = 1;
    
    // Check each line for potential issues
    for (const line of content.split('\n')) {
      for (const pattern of patterns) {
        const matches = line.match(pattern);
        if (matches) {
          // Check if there's no null/undefined check before using .href
          if (!line.includes('?') && !line.includes('&&') && !line.includes('if')) {
            issues.push({
              file,
              lineNumber,
              line: line.trim(),
              suggestion: createSuggestion(line)
            });
          }
        }
      }
      lineNumber++;
    }
  }
  
  // Report findings
  if (issues.length === 0) {
    console.log('✅ No potential href issues found!');
  } else {
    console.log(`⚠️ Found ${issues.length} potential issues:`);
    for (const issue of issues) {
      console.log(`\nFile: ${path.relative(__dirname, issue.file)}:${issue.line}`);
      console.log(`Line ${issue.lineNumber}: ${issue.line}`);
      console.log(`Suggestion: ${issue.suggestion}`);
    }
    
    console.log('\n🔧 Do you want to automatically fix these issues? (y/n)');
    // In a real scenario, this would wait for user input
    // Here we'll just suggest manual fixes
  }
}

// Helper function to recursively get all JS files
async function getAllJsFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      files.push(...await getAllJsFiles(fullPath));
    } else if (entry.name.endsWith('.js') || entry.name.endsWith('.jsx') || 
               entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Generate a safer code suggestion
function createSuggestion(line) {
  // Handle different patterns differently
  if (line.includes('.href')) {
    return line.replace(/([a-zA-Z0-9_\.]+)\.href/g, 'typeof $1 !== "undefined" && $1 ? $1.href : ""');
  } else if (line.includes('.profile_url')) {
    return line.replace(/([a-zA-Z0-9_\.]+)\.profile_url/g, 'typeof $1 !== "undefined" && $1 ? $1.profile_url : ""');
  } else if (line.includes('router.push')) {
    return line.replace(/router\.push\(([^)]+)\)/g, 'if ($1) { router.push($1) }');
  } else if (line.includes('navigation.navigate')) {
    return line.replace(/navigation\.navigate\(([^)]+)\)/g, 'if ($1) { navigation.navigate($1) }');
  }
  
  return 'Add a null/undefined check before accessing properties';
}

// Run the script
findVulnerablePaths().catch(console.error);

/*
To apply these fixes in your React Native code, follow these patterns:

1. Add optional chaining:
   Before: user.profile_url
   After:  user?.profile_url

2. Add conditional checks:
   Before: router.push(user.profile_url)
   After:  if (user?.profile_url) { router.push(user.profile_url) }

3. Add default values:
   Before: <Link href={profile.url}>Profile</Link>
   After:  <Link href={profile?.url || '#'}>Profile</Link>

4. For complex navigation logic:
   if (user && user.onboarding_completed) {
     navigation.navigate('Dashboard');
   } else if (user) {
     navigation.navigate('Onboarding');
   } else {
     navigation.navigate('Login');
   }
*/
