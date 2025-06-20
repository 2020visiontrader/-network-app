// Fix for undefined property access issues

const fs = require('fs');
const path = require('path');

// Files and fixes
const filesToFix = [
  {
    path: path.resolve(__dirname, './src/screens/OnboardingScreen.js'),
    replacements: [
      {
        search: /if\s*\(\s*!result\.canceled\s*\)\s*{\s*\n\s*setProfileImage\s*\(\s*result\.assets\s*\[\s*0\s*\]\.uri\s*\)\s*;\s*\n\s*}/g,
        replace: 'if (!result.canceled && result.assets && result.assets[0]) {\n      setProfileImage(result.assets[0].uri);\n    }'
      }
    ]
  },
  {
    path: path.resolve(__dirname, './src/screens/ProfileScreen.js'),
    replacements: [
      {
        search: /if\s*\(\s*!result\.canceled\s*\)\s*{\s*\n\s*setProfileImage\s*\(\s*result\.assets\s*\[\s*0\s*\]\.uri\s*\)\s*;\s*\n\s*}/g,
        replace: 'if (!result.canceled && result.assets && result.assets[0]) {\n      setProfileImage(result.assets[0].uri);\n    }'
      }
    ]
  },
  {
    path: path.resolve(__dirname, './src/services/ErrorHandler.js'),
    replacements: [
      {
        search: /url: typeof window !== 'undefined' \? window\.location\.href : 'unknown'/g,
        replace: 'url: typeof window !== \'undefined\' && window.location ? window.location.href : \'unknown\''
      }
    ]
  }
];

// Process each file
filesToFix.forEach(file => {
  try {
    if (fs.existsSync(file.path)) {
      console.log(`Processing ${file.path}...`);
      let content = fs.readFileSync(file.path, 'utf8');
      let modified = false;
      
      file.replacements.forEach(replacement => {
        if (replacement.search.test(content)) {
          content = content.replace(replacement.search, replacement.replace);
          modified = true;
          console.log('- Made replacement');
        } else {
          console.log('- Pattern not found');
        }
      });
      
      if (modified) {
        fs.writeFileSync(file.path, content);
        console.log(`✅ Fixed ${file.path}`);
      } else {
        console.log(`⚠️ No changes made to ${file.path}`);
      }
    } else {
      console.log(`❌ File not found: ${file.path}`);
    }
  } catch (error) {
    console.error(`Error fixing ${file.path}:`, error);
  }
});

console.log('\nAll fixes have been applied. Please restart your Expo app to see the changes.');
