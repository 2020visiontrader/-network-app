import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const SignUpScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const { signUp, checkEmailExists } = useAuth();

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { email, password, confirmPassword } = formData;
    
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Check if email already exists
      const emailExists = await checkEmailExists(formData.email.toLowerCase().trim());
      
      if (emailExists) {
        Alert.alert('Error', 'An account with this email already exists');
        setLoading(false);
        return;
      }

      // Profile is empty - fields will be completed during onboarding
      // We're not creating the profile directly here anymore

      const result = await signUp(
        formData.email.toLowerCase().trim(),
        formData.password
      );
      
      if (result.success) {
        Alert.alert(
          'Welcome!',
          'Your account has been created successfully. Please complete your profile.',
          [{ text: 'Continue to Onboarding' }]
        );
        // Navigation will be handled by the auth state change
        // App.js will detect the missing onboarding data and route to onboarding
      } else {
        Alert.alert('Sign Up Failed', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      console.error('Sign up error:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToSignIn = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Join the Network</Text>
          <Text style={styles.subtitle}>Connect with fellow founders and grow together</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={(value) => updateField('password', value)}
              placeholder="Create a password (min 6 characters)"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              autoComplete="password-new"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              value={formData.confirmPassword}
              onChangeText={(value) => updateField('confirmPassword', value)}
              placeholder="Confirm your password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              autoComplete="password-new"
            />
          </View>

          <TouchableOpacity
            style={[styles.signUpButton, loading && styles.disabledButton]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.signUpButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.signInButton}
            onPress={navigateToSignIn}
            disabled={loading}
          >
            <Text style={styles.signInButtonText}>
              Already have an account? <Text style={styles.signInLink}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b', // Zinc-950
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a1a1aa', // Zinc-400
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#18181b', // Zinc-900
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#27272a', // Zinc-800
    shadowColor: '#a855f7',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#09090b', // Zinc-950
  },
  signUpButton: {
    backgroundColor: '#a855f7', // Purple-500
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    color: '#9CA3AF',
    marginHorizontal: 16,
    fontSize: 14,
  },
  signInButton: {
    alignItems: 'center',
    padding: 8,
  },
  signInButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  signInLink: {
    color: '#3B82F6',
    fontWeight: '600',
  },
});

export default SignUpScreen;
