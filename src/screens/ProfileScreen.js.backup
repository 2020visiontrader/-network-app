import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

const ProfileScreen = ({ navigation }) => {
  const { user, userData, signOut, refreshUserData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profile, setProfile] = useState({
    full_name: userData?.full_name || '',
    preferred_name: userData?.preferred_name || '',
    company_name: userData?.company_name || '',
    role: userData?.role || 'Founder',
    bio: userData?.bio || '',
    location: userData?.location || '',
    linkedin_url: userData?.linkedin_url || '',
    tags: userData?.tags || '',
    is_visible: userData?.is_visible ?? true,
  });

  useEffect(() => {
    if (userData) {
      setProfile({
        full_name: userData.full_name || '',
        preferred_name: userData.preferred_name || '',
        company_name: userData.company_name || '',
        role: userData.role || 'Founder',
        bio: userData.bio || '',
        location: userData.location || '',
        linkedin_url: userData.linkedin_url || '',
        tags: userData.tags || '',
        is_visible: userData.is_visible ?? true,
      });
      setProfileImage(userData.avatar_url);
    }
  }, [userData]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to continue.');
      return;
    }

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
        .from('avatars')
        .upload(fileName, arrayBuffer, {
          contentType: `image/${fileExt}`,
        });

      if (error) throw error;
      
      const { data: publicData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return publicData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const updateProfile = async () => {
    try {
      setLoading(true);
      
      let avatar_url = profileImage;
      if (profileImage && profileImage !== userData?.avatar_url) {
        avatar_url = await uploadImage(profileImage);
      }
      
      const updateData = {
        ...profile,
        avatar_url,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('founders')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      await refreshUserData();
      Alert.alert('Success', 'Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const handleSave = () => {
    if (!profile.full_name.trim() || !profile.company_name.trim()) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }
    updateProfile();
  };

  const ProfileField = ({ label, value, onChangeText, multiline = false, required = false }) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      {editing ? (
        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          value={value}
          onChangeText={onChangeText}
          placeholder={`Enter your ${label.toLowerCase()}`}
          placeholderTextColor="#9CA3AF"
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
        />
      ) : (
        <Text style={styles.value}>{value || 'Not specified'}</Text>
      )}
    </View>
  );

  if (loading && !editing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Profile</Text>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#888" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileCard}>
        {/* Profile Image */}
        <TouchableOpacity style={styles.imageContainer} onPress={editing ? pickImage : null}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="person" size={40} color="#7d58ff" />
            </View>
          )}
          {editing && (
            <View style={styles.editImageBadge}>
              <Ionicons name="camera" size={16} color="#ffffff" />
            </View>
          )}
        </TouchableOpacity>

        {/* Profile Fields */}
        <ProfileField
          label="Full Name"
          value={profile.full_name}
          onChangeText={(text) => setProfile(prev => ({ ...prev, full_name: text }))}
          required
        />

        <ProfileField
          label="Preferred Name"
          value={profile.preferred_name}
          onChangeText={(text) => setProfile(prev => ({ ...prev, preferred_name: text }))}
        />

        <ProfileField
          label="Company Name"
          value={profile.company_name}
          onChangeText={(text) => setProfile(prev => ({ ...prev, company_name: text }))}
          required
        />

        <ProfileField
          label="Role"
          value={profile.role}
          onChangeText={(text) => setProfile(prev => ({ ...prev, role: text }))}
          required
        />

        <ProfileField
          label="Location"
          value={profile.location}
          onChangeText={(text) => setProfile(prev => ({ ...prev, location: text }))}
        />

        <ProfileField
          label="LinkedIn URL"
          value={profile.linkedin_url}
          onChangeText={(text) => setProfile(prev => ({ ...prev, linkedin_url: text }))}
        />

        <ProfileField
          label="Bio"
          value={profile.bio}
          onChangeText={(text) => setProfile(prev => ({ ...prev, bio: text }))}
          multiline
        />

        <ProfileField
          label="Tags/Interests"
          value={profile.tags}
          onChangeText={(text) => setProfile(prev => ({ ...prev, tags: text }))}
        />

        {/* Visibility Toggle */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Profile Visibility</Text>
          <TouchableOpacity
            style={styles.toggleContainer}
            onPress={() => editing && setProfile(prev => ({ ...prev, is_visible: !prev.is_visible }))}
          >
            <View style={[styles.toggle, profile.is_visible && styles.toggleActive]}>
              <View style={[styles.toggleDot, profile.is_visible && styles.toggleDotActive]} />
            </View>
            <Text style={styles.toggleText}>
              {profile.is_visible ? 'Visible to other founders' : 'Hidden from discovery'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {editing ? (
            <>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditing(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditing(true)}
            >
              <Ionicons name="create-outline" size={20} color="#ffffff" />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#100c1c',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#100c1c',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  signOutButton: {
    padding: 8,
  },
  profileCard: {
    backgroundColor: '#1a1a1a',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editImageBadge: {
    position: 'absolute',
    bottom: 5,
    right: '35%',
    backgroundColor: '#7d58ff',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  required: {
    color: '#f9cb40',
  },
  input: {
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    backgroundColor: '#1a1a1a',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  value: {
    fontSize: 16,
    color: '#ccc',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    marginRight: 12,
  },
  toggleActive: {
    backgroundColor: '#7d58ff',
  },
  toggleDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#666',
    marginLeft: 3,
  },
  toggleDotActive: {
    backgroundColor: '#ffffff',
    marginLeft: 23,
  },
  toggleText: {
    fontSize: 14,
    color: '#888',
  },
  actionButtons: {
    marginTop: 24,
  },
  editButton: {
    backgroundColor: '#7d58ff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: '#7d58ff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
