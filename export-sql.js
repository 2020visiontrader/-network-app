// Export SQL to a file that can be easily copied
const fs = require('fs');
const path = require('path');

// Read the SQL file
const sqlFilePath = path.join(__dirname, 'final-permission-fix.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// Create a cleaned version (removing extra comments if needed)
const outputPath = path.join(__dirname, 'final-permission-fix-clean.sql');
fs.writeFileSync(outputPath, sqlContent);

console.log(`SQL file has been exported to: ${outputPath}`);
console.log('You can now copy the contents of this file and paste it into the Supabase SQL Editor.');
console.log('\nFollow the instructions in MANUAL_DATABASE_FIX.md for step-by-step guidance.');
