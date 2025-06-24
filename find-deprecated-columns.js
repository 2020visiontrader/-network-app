// find-deprecated-columns.js
// This script searches the codebase for deprecated column names

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define the deprecated columns and their replacements
const DEPRECATED_COLUMNS = [
  { old: 'is_visible', new: 'profile_visible', table: 'founders' },
  { old: 'company', new: 'company_name', table: 'founders' },
  // Add more as needed
];

// Directories to exclude
const EXCLUDE_DIRS = [
  'node_modules',
  '.git',
  'build',
  'dist',
  '.expo',
  '.expo-shared',
];

// File extensions to search
const INCLUDE_EXTENSIONS = [
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.json',
];

// Find all potential instances of deprecated columns
function findDeprecatedColumns() {
  console.log('Searching for deprecated column usage in the codebase...\n');
  
  const results = {};
  
  DEPRECATED_COLUMNS.forEach(column => {
    console.log(`Checking for "${column.old}" (should use "${column.new}" instead)...`);
    
    try {
      // Use grep to find instances of the column name
      // This is much faster than reading and parsing each file in JS
      const grepCommand = `grep -r --include="*{${INCLUDE_EXTENSIONS.join(',')}}" "${column.old}" . --exclude-dir={${EXCLUDE_DIRS.join(',')}}`;
      
      const output = execSync(grepCommand, { encoding: 'utf8' });
      const lines = output.split('\n').filter(line => line.trim());
      
      // Filter out false positives
      const relevantLines = lines.filter(line => {
        // Skip SQL files that are meant to fix the issue
        if (line.includes('permission-fix.sql')) {
          return false;
        }
        
        // Skip comments about the migration
        if (line.includes('deprecated') || line.includes('migration')) {
          return false;
        }
        
        // Skip the current script
        if (line.includes('find-deprecated-columns.js')) {
          return false;
        }
        
        return true;
      });
      
      if (relevantLines.length > 0) {
        results[column.old] = relevantLines;
        console.log(`  Found ${relevantLines.length} potential instances`);
      } else {
        console.log('  None found!');
      }
    } catch (error) {
      // If grep exits with no matches, it returns non-zero exit code
      if (error.status !== 1) {
        console.error(`  Error searching for ${column.old}:`, error.message);
      } else {
        console.log('  None found!');
      }
    }
  });
  
  // Print summary
  console.log('\nSummary of Findings:');
  console.log('===================');
  
  let totalFound = 0;
  DEPRECATED_COLUMNS.forEach(column => {
    const count = results[column.old]?.length || 0;
    totalFound += count;
    console.log(`${column.old} -> ${column.new}: ${count} instances`);
  });
  
  if (totalFound === 0) {
    console.log('\n✅ No deprecated column usage found!');
  } else {
    console.log(`\n⚠️ Found ${totalFound} instances of deprecated column usage.`);
    
    // Print details
    console.log('\nDetailed Findings:');
    console.log('=================');
    
    DEPRECATED_COLUMNS.forEach(column => {
      if (results[column.old] && results[column.old].length > 0) {
        console.log(`\n${column.old} -> ${column.new} (${column.table} table):`);
        results[column.old].forEach((line, i) => {
          console.log(`  ${i+1}. ${line}`);
        });
      }
    });
    
    console.log('\nReminder: Update all references to use the standardized column names.');
  }
}

// Run the search
findDeprecatedColumns();
