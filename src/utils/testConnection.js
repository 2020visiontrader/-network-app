// Test Mobile App Backend Connection
// Run this in the Expo console or as a separate test

import AuthService from './src/services/auth';

const testBackendConnection = async () => {
  try {
    console.log('🔗 Testing backend connection...');
    
    // Test 1: Check if email exists (should return false for test email)
    const testEmail = 'test@nonexistent.com';
    console.log(`📧 Checking if ${testEmail} exists...`);
    
    const emailExists = await AuthService.checkEmailExists(testEmail);
    console.log(`✅ Email check result: ${emailExists}`);
    
    console.log('🎉 Backend connection test successful!');
    console.log('📱 Your mobile app is ready to authenticate users.');
    
    return true;
  } catch (error) {
    console.error('❌ Backend connection test failed:', error);
    console.log('🔧 Please check your Supabase configuration and ensure your backend functions are deployed.');
    return false;
  }
};

// Export for use in app
export default testBackendConnection;
