// Add required dependencies to package.json
const fs = require('fs');
const path = require('path');

// Path to package.json
const packageJsonPath = path.join(__dirname, 'package.json');

// Check if package.json exists
if (!fs.existsSync(packageJsonPath)) {
  console.error('package.json not found. Are you in the right directory?');
  process.exit(1);
}

// Read package.json
let packageJson;
try {
  packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
} catch (error) {
  console.error('Failed to parse package.json:', error);
  process.exit(1);
}

// Ensure dependencies object exists
if (!packageJson.dependencies) {
  packageJson.dependencies = {};
}

// Required dependencies
const requiredDeps = {
  '@supabase/supabase-js': '^2.31.0',
  'dotenv': '^16.3.1',
  'uuid': '^9.0.0'
};

// Add dependencies if they don't exist
let depsAdded = false;
for (const [dep, version] of Object.entries(requiredDeps)) {
  if (!packageJson.dependencies[dep]) {
    packageJson.dependencies[dep] = version;
    console.log(`Added ${dep}@${version}`);
    depsAdded = true;
  } else {
    console.log(`${dep} already exists: ${packageJson.dependencies[dep]}`);
  }
}

// Add scripts if they don't exist
if (!packageJson.scripts) {
  packageJson.scripts = {};
}

const scripts = {
  'test:persistence': 'node verify-persistence.js',
  'fix:database': 'node execute-sql.js final-permission-fix.sql'
};

for (const [name, cmd] of Object.entries(scripts)) {
  if (!packageJson.scripts[name]) {
    packageJson.scripts[name] = cmd;
    console.log(`Added script: ${name}`);
    depsAdded = true;
  } else {
    console.log(`Script ${name} already exists: ${packageJson.scripts[name]}`);
  }
}

// Write updated package.json if changes were made
if (depsAdded) {
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('Updated package.json');
  console.log('Please run "npm install" to install the required dependencies');
} else {
  console.log('No changes made to package.json');
}
