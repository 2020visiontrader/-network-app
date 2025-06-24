/**
 * Test utilities for NetworkFounderApp test scripts
 */

// Sleep function for async tests
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Logging functions with formatting
function logHeader(text) {
  console.log('\n=================================================');
  console.log(`🔍 ${text}`);
  console.log('=================================================');
}

function logSuccess(text) {
  console.log('✅ ' + text);
}

function logError(text) {
  console.log('❌ ' + text);
}

function logInfo(text) {
  console.log('ℹ️ ' + text);
}

module.exports = {
  sleep,
  logHeader,
  logSuccess,
  logError,
  logInfo
};
