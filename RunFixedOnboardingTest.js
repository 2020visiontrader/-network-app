// RunFixedOnboardingTest.js - Test runner for the fixed onboarding flow
import { testFixedOnboardingFlow } from './OnboardingFixTests';

// Run the test and output results to console
console.log('🧪 Starting Onboarding Flow Test with Fixes...\n');

testFixedOnboardingFlow()
  .then(() => {
    console.log('\n✅ Test execution completed');
  })
  .catch(err => {
    console.error('\n❌ Test execution failed:', err);
  });
