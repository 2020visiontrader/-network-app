import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { FormValidator } from '../utils/FormValidator';

export default function OnboardingScreen() {
  const { user, refreshUserData } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    linkedin_url: '',
    location_city: '',
    industry: '',
    company_name: '',
    role: '',
    bio: '',
    tags_or_interests: [],
    profile_visible: true,
  });

  const roleOptions = ['Founder', 'Investor', 'Creator', 'Operator'];
  const industryOptions = ['Tech', 'Healthcare', 'Finance', 'Education', 'E-commerce', 'SaaS', 'AI/ML', 'Crypto/Web3', 'Consumer', 'B2B', 'Other'];

  const pickImage = async () => {
    // Request both camera and media library permissions
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraPermission.status !== 'granted' || mediaLibraryPermission.status !== 'granted') {
      Alert.alert(
        'Permission Required', 
        'Please grant camera and photo library permissions to upload a profile picture.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Settings', onPress: () => Linking.openSettings() }
        ]
      );
      return;
    }

    Alert.alert(
      'Select Photo',
      'Choose how you would like to add your profile picture',
      [
        { text: 'Camera', onPress: () => openCamera() },
        { text: 'Photo Library', onPress: () => openImageLibrary() },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const openCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const openImageLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();
      
      const fileExt = uri.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('avatar')
        .upload(fileName, arrayBuffer, {
          contentType: `image/${fileExt}`,
        });

      if (error) {
        console.error('Storage upload error:', error);
        // Don't throw error - continue without avatar
        return null;
      }
      
      const { data: publicData } = supabase.storage
        .from('avatar')
        .getPublicUrl(fileName);

      return publicData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      // Return null instead of throwing - avatar is optional
      return null;
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.full_name || !formData.role || !formData.location_city || 
        !formData.linkedin_url || !formData.company_name || !formData.industry || 
        !formData.bio || formData.tags_or_interests.length === 0) {
      Alert.alert('Missing Information', 'Please fill in all required fields and add at least one tag/interest.');
      return;
    }

    if (!FormValidator.validateLinkedInUrl(formData.linkedin_url)) {
      Alert.alert('Invalid LinkedIn URL', 'Please enter a valid LinkedIn profile URL.');
      return;
    }

    setLoading(true);

    try {
      let avatar_url = null;
      if (profileImage) {
        console.log('Attempting to upload profile image...');
        avatar_url = await uploadImage(profileImage);
        if (!avatar_url) {
          console.log('Avatar upload failed, continuing without image');
          Alert.alert(
            'Image Upload Failed', 
            'Your profile will be saved without a photo. You can add one later.',
            [{ text: 'Continue', style: 'default' }]
          );
        }
      }

      console.log('Updating profile with data:', formData);

      // Use upsert to handle both new and existing users
      const { error } = await supabase
        .from('founders')
        .upsert({
          id: user.id, // Include the user ID for upsert
          email: user.email, // Include email as well
          full_name: formData.full_name,
          linkedin_url: formData.linkedin_url,
          location_city: formData.location_city,
          industry: formData.industry,
          company_name: formData.company_name,
          role: formData.role,
          bio: formData.bio,
          tags_or_interests: formData.tags_or_interests,
          profile_visible: formData.profile_visible,
          avatar_url,
          onboarding_completed: true,
          profile_progress: 100,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id); // This ensures RLS auth.uid() match

      if (error) {
        console.error('Profile update error:', error);
        throw error;
      }

      console.log('Profile update successful');
      
      // Refresh user data to trigger navigation change
      await refreshUserData();

      Alert.alert(
        'Success!', 
        'Your profile has been set up successfully. Welcome to NETWORK!',
        [
          {
            text: 'Continue',
            onPress: async () => {
              // Force refresh user data and let App.js handle navigation
              await refreshUserData();
              // App.js will automatically detect onboarding_completed = true and switch to AppStack
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error completing onboarding:', error);
      
      // Provide specific error messages
      let errorMessage = 'Failed to save your profile. Please try again.';
      
      if (error.message.includes('row-level security')) {
        errorMessage = 'Authentication error. Please sign out and sign back in, then try again.';
      } else if (error.message.includes('storage')) {
        errorMessage = 'Image upload failed. Your profile was saved without a photo.';
      } else if (error.code) {
        errorMessage = `Database error (${error.code}): ${error.message}`;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
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
            Help other founders find and connect with you
          </Text>
        </View>

        {/* Profile Image */}
        <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera" size={40} color="#7d58ff" />
              <Text style={styles.imageText}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Form Fields */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.full_name}
              onChangeText={(text) => setFormData({...formData, full_name: text})}
              placeholder="Your full name"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Role *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roleContainer}>
              {roleOptions.map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleButton,
                    formData.role === role && styles.roleButtonActive
                  ]}
                  onPress={() => setFormData({...formData, role})}
                >
                  <Text style={[
                    styles.roleText,
                    formData.role === role && styles.roleTextActive
                  ]}>
                    {role}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location *</Text>
            <TextInput
              style={styles.input}
              value={formData.location_city}
              onChangeText={(text) => setFormData({...formData, location_city: text})}
              placeholder="City, Country"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>LinkedIn URL *</Text>
            <TextInput
              style={styles.input}
              value={formData.linkedin_url}
              onChangeText={(text) => setFormData({...formData, linkedin_url: text})}
              placeholder="https://linkedin.com/in/yourprofile"
              placeholderTextColor="#666"
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Company *</Text>
            <TextInput
              style={styles.input}
              value={formData.company_name}
              onChangeText={(text) => setFormData({...formData, company_name: text})}
              placeholder="Your company or startup"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Industry *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roleContainer}>
              {industryOptions.map((industry) => (
                <TouchableOpacity
                  key={industry}
                  style={[
                    styles.roleButton,
                    formData.industry === industry && styles.roleButtonActive
                  ]}
                  onPress={() => setFormData({...formData, industry})}
                >
                  <Text style={[
                    styles.roleText,
                    formData.industry === industry && styles.roleTextActive
                  ]}>
                    {industry}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.bio}
              onChangeText={(text) => setFormData({...formData, bio: text})}
              placeholder="Tell us about yourself and what you're working on..."
              placeholderTextColor="#666"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tags/Interests *</Text>
            <TextInput
              style={styles.input}
              value={formData.tags_or_interests.join(', ')}
              onChangeText={(text) => {
                const tagsArray = text.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
                setFormData({...formData, tags_or_interests: tagsArray});
              }}
              placeholder="AI, fintech, health, etc. (comma separated)"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.visibilityContainer}>
            <TouchableOpacity
              style={styles.visibilityToggle}
              onPress={() => setFormData({...formData, profile_visible: !formData.profile_visible})}
            >
              <Ionicons
                name={formData.profile_visible ? "eye" : "eye-off"}
                size={24}
                color={formData.profile_visible ? "#a855f7" : "#666"}
              />
              <Text style={styles.visibilityText}>
                {formData.profile_visible ? "Profile Visible" : "Profile Hidden"}
              </Text>
            </TouchableOpacity>
            <Text style={styles.visibilitySubtext}>
              {formData.profile_visible 
                ? "Other founders can discover and connect with you"
                : "Only direct connections can see your profile"
              }
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Saving...' : 'Complete Setup'}
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b', // Zinc-950 (black)
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a1a1aa', // Zinc-400
    textAlign: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#a855f7', // Purple-500
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#18181b', // Zinc-900
    borderWidth: 2,
    borderColor: '#a855f7', // Purple-500
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageText: {
    color: '#a855f7', // Purple-500
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  form: {
    paddingHorizontal: 24,
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
    backgroundColor: '#18181b', // Zinc-900
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#27272a', // Zinc-800
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  roleContainer: {
    flexDirection: 'row',
  },
  roleButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#18181b', // Zinc-900
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#27272a', // Zinc-800
  },
  roleButtonActive: {
    backgroundColor: '#a855f7', // Purple-500
    borderColor: '#a855f7',
  },
  roleText: {
    color: '#a1a1aa', // Zinc-400
    fontSize: 14,
    fontWeight: '600',
  },
  roleTextActive: {
    color: '#ffffff',
  },
  visibilityContainer: {
    marginTop: 8,
  },
  visibilityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  visibilityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 12,
  },
  visibilitySubtext: {
    fontSize: 14,
    color: '#a1a1aa', // Zinc-400
    marginLeft: 36,
  },
  submitButton: {
    backgroundColor: '#a855f7', // Purple-500
    borderRadius: 12,
    padding: 18,
    marginHorizontal: 24,
    marginTop: 32,
    alignItems: 'center',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 32,
  },
});
