// FINAL MOBILE APP AUTH IMPLEMENTATION
// This includes Google OAuth support for the mobile app

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { supabase } from '../services/supabase';

// Configure Google Sign-In (add this to your App.js or AuthContext.js)
GoogleSignin.configure({
  webClientId: 'YOUR_GOOGLE_WEB_CLIENT_ID', // From Google Cloud Console
  iosClientId: 'YOUR_GOOGLE_IOS_CLIENT_ID', // From Google Cloud Console  
});

// Add this to your AuthContext.js
const signInWithGoogle = async () => {
  try {
    setLoading(true);
    
    // Check if device supports Google Play Services
    await GoogleSignin.hasPlayServices();
    
    // Get user info from Google
    const userInfo = await GoogleSignin.signIn();
    
    // Sign in with Supabase using Google ID token
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: userInfo.idToken,
    });

    if (error) throw error;

    // Check if user profile exists, create if not
    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from('founders')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError && profileError.code === 'PGRST116') {
        // User doesn't exist, create profile
        const { error: createError } = await supabase
          .from('founders')
          .insert({
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.user_metadata?.full_name || userInfo.user.name,
            avatar_url: data.user.user_metadata?.avatar_url || userInfo.user.photo,
            onboarding_complete: false,
          });

        if (createError) {
          console.error('Profile creation error:', createError);
        }
      }
    }

    return { success: true, data };
  } catch (error) {
    console.error('Google sign in error:', error);
    return { 
      success: false, 
      error: error.message || 'Google sign in failed' 
    };
  } finally {
    setLoading(false);
  }
};

// Add this to your LoginScreen.js and SignUpScreen.js
const GoogleSignInButton = () => (
  <TouchableOpacity
    style={styles.googleButton}
    onPress={signInWithGoogle}
    disabled={loading}
  >
    <Image 
      source={require('../assets/google-icon.png')} // Add Google icon
      style={styles.googleIcon}
    />
    <Text style={styles.googleButtonText}>Continue with Google</Text>
  </TouchableOpacity>
);

// Styles for Google button
const googleStyles = StyleSheet.create({
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  googleButtonText: {
    color: '#3C4043',
    fontSize: 16,
    fontWeight: '500',
  },
});

export { signInWithGoogle, GoogleSignInButton };
