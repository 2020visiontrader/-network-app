import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { FormValidator } from '../utils/FormValidator';
import { FounderService } from '../services/FounderService';
import { ErrorHandler } from '../services/ErrorHandler';

export default function OnboardingForm({ onComplete }) {
  const { user, refreshUserData } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    linkedin_url: '',
    location_city: '',
    industry: '',
    company_name: '',
    role: '',
    tags_or_interests: [],
    profile_visible: true,
  });

  const roleOptions = ['Founder', 'Co-Founder', 'CEO', 'CTO', 'CPO', 'CMO', 'VP', 'Director', 'Other'];
  const industryOptions = ['Tech', 'Healthcare', 'Finance', 'Education', 'E-commerce', 'SaaS', 'AI/ML', 'Crypto/Web3', 'Consumer', 'B2B', 'Other'];

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTagsChange = (text) => {
    const tags = text.split(',').map(tag => tag.trim()).filter(tag => tag);
    updateFormData('tags_or_interests', tags);
  };

  const handleSubmit = async () => {
    // Validate form using the real validator
    const validation = FormValidator.validateOnboardingForm(formData);
    
    if (!validation.isValid) {
      const errorMessage = ErrorHandler.createUserFriendlyMessage(validation.errors, 'Please check your form and try again.');
      Alert.alert('Form Validation Error', errorMessage);
      return;
    }

    setLoading(true);

    try {
      console.log('Submitting onboarding form with data:', formData);

      // Get user's full name from auth context to include in the update
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const fullName = authUser?.user_metadata?.full_name || '';

      // Use the enhanced onboarding service for database operations
      const result = await FounderService.upsertFounderOnboarding(
        user.id,
        user.email,
        {
          // Include full_name from auth context if available
          full_name: fullName,
          linkedin_url: formData.linkedin_url,
          location_city: formData.location_city,
          industry: formData.industry,
          company_name: formData.company_name,
          role: formData.role,
          tags_or_interests: FormValidator.formatTags(formData.tags_or_interests),
          profile_visible: formData.profile_visible,
          onboarding_completed: true,  // Explicitly set this
          profile_progress: 100        // Explicitly set this
        }
      );

      if (!result.success) {
        const errorMessage = ErrorHandler.createUserFriendlyMessage(result, 'Failed to save your profile.');
        Alert.alert('Save Error', errorMessage);
        ErrorHandler.logError(result, 'onboarding', { userId: user.id });
        return;
      }

      console.log('Profile operation successful:', result.data);
      
      // Re-fetch founder profile to confirm onboarding_completed is set
      let founderId = user.id;
      let founder = null;
      let retryCount = 0;
      const maxRetries = 1;
      
      while (!founder && retryCount <= maxRetries) {
        // Refresh user data first
        await refreshUserData();
        
        // Get the founder record directly
        const founderResult = await FounderService.getFounder(founderId);
        
        if (founderResult.success && founderResult.data) {
          founder = founderResult.data;
          console.log('Retrieved founder profile:', founder);
          
          // Check if onboarding is marked as completed
          if (!founder.onboarding_completed) {
            console.log('WARNING: onboarding_completed not set in founder record, forcing update');
            
            // Force an update to set onboarding_completed = true
            const updateResult = await FounderService.updateFounder(founderId, {
              onboarding_completed: true,
              profile_progress: 100
            });
            
            console.log('Manual update of onboarding status:', updateResult);
            
            // Refresh user data and founder record again
            await refreshUserData();
            const refreshedResult = await FounderService.getFounder(founderId);
            if (refreshedResult.success) {
              founder = refreshedResult.data;
            }
          }
        } else {
          console.log(`Attempt ${retryCount + 1}: Failed to retrieve founder profile, will ${retryCount < maxRetries ? 'retry' : 'abort'}`);
          retryCount++;
          
          if (retryCount <= maxRetries) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      if (!founder) {
        console.error('Failed to retrieve founder profile after maximum retries');
        Alert.alert(
          'Profile Update Error',
          'Your profile was saved but we could not verify the update. Please try again or contact support.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Show success message before navigation
      Alert.alert(
        'Success!', 
        'Your profile has been set up successfully. Welcome to NETWORK!',
        [
          {
            text: 'Continue to Dashboard',
            onPress: async () => {
              // Navigate to Dashboard
              navigateToDashboard();
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error completing onboarding:', error);
      
      const errorMessage = ErrorHandler.createUserFriendlyMessage(error, 'Failed to save your profile. Please try again.');
      Alert.alert('Error', errorMessage);
      
      ErrorHandler.logError(error, 'onboarding', { 
        userId: user.id, 
        formData: formData 
      });
    } finally {
      setLoading(false);
    }
  };

  const navigateToDashboard = () => {
    console.log('Navigating to dashboard...');
    
    // Call onComplete callback if provided
    if (onComplete) {
      console.log('Calling onComplete callback');
      try {
        onComplete();
      } catch (callbackError) {
        console.error('Error in onComplete callback:', callbackError);
      }
    }
    
    // Short delay to ensure callback completes and state updates
    setTimeout(() => {
      try {
        // Always use reset for consistent navigation
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
        console.log('Navigation reset successful');
      } catch (error) {
        console.error('Navigation error:', error);
        
        // Last resort - alert the user to restart the app
        Alert.alert(
          'Navigation Error',
          'Please restart the app to continue to the Dashboard.',
          [{ text: 'OK' }]
        );
      }
    }, 300); // Small delay to ensure state updates
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            Tell us about yourself to join the NETWORK community
          </Text>
        </View>

        <View style={styles.form}>
          {/* LinkedIn URL */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>LinkedIn Profile *</Text>
            <TextInput
              style={styles.input}
              value={formData.linkedin_url}
              onChangeText={(text) => updateFormData('linkedin_url', text)}
              placeholder="https://linkedin.com/in/yourprofile"
              placeholderTextColor="#6b7280"
              keyboardType="url"
            />
          </View>

          {/* Location */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location (City) *</Text>
            <TextInput
              style={styles.input}
              value={formData.location_city}
              onChangeText={(text) => updateFormData('location_city', text)}
              placeholder="San Francisco, New York, etc."
              placeholderTextColor="#6b7280"
            />
          </View>

          {/* Company Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Company Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.company_name}
              onChangeText={(text) => updateFormData('company_name', text)}
              placeholder="Your company name"
              placeholderTextColor="#6b7280"
            />
          </View>

          {/* Role */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Role *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsContainer}>
              {roleOptions.map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.optionButton,
                    formData.role === role && styles.optionButtonSelected
                  ]}
                  onPress={() => updateFormData('role', role)}
                >
                  <Text style={[
                    styles.optionText,
                    formData.role === role && styles.optionTextSelected
                  ]}>
                    {role}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Industry */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Industry *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsContainer}>
              {industryOptions.map((industry) => (
                <TouchableOpacity
                  key={industry}
                  style={[
                    styles.optionButton,
                    formData.industry === industry && styles.optionButtonSelected
                  ]}
                  onPress={() => updateFormData('industry', industry)}
                >
                  <Text style={[
                    styles.optionText,
                    formData.industry === industry && styles.optionTextSelected
                  ]}>
                    {industry}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Tags/Interests */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tags/Interests *</Text>
            <TextInput
              style={styles.input}
              value={formData.tags_or_interests.join(', ')}
              onChangeText={handleTagsChange}
              placeholder="AI, SaaS, Health Tech, etc. (comma-separated)"
              placeholderTextColor="#6b7280"
            />
          </View>

          {/* Profile Visibility */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => updateFormData('profile_visible', !formData.profile_visible)}
          >
            <View style={[styles.checkbox, formData.profile_visible && styles.checkboxChecked]}>
              {formData.profile_visible && (
                <Ionicons name="checkmark" size={16} color="#ffffff" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>
              Make my profile visible to other founders
            </Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Completing Profile...' : 'Complete Profile & Join Network'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    lineHeight: 24,
  },
  form: {
    padding: 24,
    paddingTop: 0,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#374151',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    flexDirection: 'row',
  },
  optionButton: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  optionButtonSelected: {
    backgroundColor: '#A855F7', // Primary purple
    borderColor: '#A855F7',
  },
  optionText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#ffffff',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#374151',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#A855F7', // Primary purple
    borderColor: '#A855F7',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#d1d5db',
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#A855F7', // Primary purple
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 40,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
