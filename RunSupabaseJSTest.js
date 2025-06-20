// RunSupabaseJSTest.js - Script to run the direct Supabase JS tests
const { testSupabaseJSOperations } = require('./SupabaseJSTest.js');

console.log('🚀 Starting Supabase JS Operations Test...\n');

testSupabaseJSOperations()
  .then(() => {
    console.log('\nTest execution completed. Check the logs above for results.');
  })
  .catch(err => {
    console.error('\nUnexpected error running test:', err);
  });
