import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as Device from 'expo-device';

// Initialize Supabase with your configuration
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

class AuthService {
  constructor() {
    this.currentSession = null;
    this.currentUser = null;
  }

  // Generate unique device ID
  async getDeviceId() {
    let deviceId = await SecureStore.getItemAsync('device_id');
    if (!deviceId) {
      deviceId = `${Platform.OS}_${Device.modelName}_${Date.now()}`;
      await SecureStore.setItemAsync('device_id', deviceId);
    }
    return deviceId;
  }

  // Get device info for mobile functions
  async getDeviceInfo() {
    return {
      device_id: await this.getDeviceId(),
      platform: Platform.OS,
      app_version: Constants.expoConfig?.version || '1.0.0',
      device_model: Device.modelName || 'Unknown',
      os_version: Device.osVersion || 'Unknown'
    };
  }

  // Check if email exists in database
  async checkEmailExists(email) {
    try {
      const { data, error } = await supabase.rpc('mobile_user_exists', {
        p_email: email
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error checking email:', error);
      throw error;
    }
  }

  // Complete signup flow
  async signUp(email, password, profile) {
    try {
      const deviceInfo = await this.getDeviceInfo();
      
      const { data, error } = await supabase.rpc('mobile_signup_complete', {
        p_email: email,
        p_password: password,
        p_full_name: profile.fullName,
        p_company_name: profile.companyName,
        p_role: profile.role || 'Founder',
        p_device_info: deviceInfo
      });

      if (error) throw error;

      // Store session
      if (data && data.token) {
        await this.storeSession(data);
        this.currentSession = data;
        this.currentUser = data.founder;
      }

      return data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  // Login with email and password
  async signIn(email, password) {
    try {
      const deviceInfo = await this.getDeviceInfo();
      
      const { data, error } = await supabase.rpc('mobile_authenticate', {
        p_email: email,
        p_password: password,
        p_device_info: deviceInfo
      });

      if (error) throw error;

      if (data && data.token) {
        await this.storeSession(data);
        this.currentSession = data;
        this.currentUser = data.founder;
      }

      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  // Store session securely
  async storeSession(sessionData) {
    try {
      await SecureStore.setItemAsync('auth_token', sessionData.token);
      await AsyncStorage.setItem('user_session', JSON.stringify(sessionData));
    } catch (error) {
      console.error('Error storing session:', error);
    }
  }

  // Get stored session
  async getStoredSession() {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const sessionStr = await AsyncStorage.getItem('user_session');
      
      if (token && sessionStr) {
        const sessionData = JSON.parse(sessionStr);
        
        // Verify token is still valid by refreshing session
        const refreshedSession = await this.refreshSession(token);
        if (refreshedSession) {
          return refreshedSession;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting stored session:', error);
      return null;
    }
  }

  // Refresh session
  async refreshSession(token) {
    try {
      const deviceInfo = await this.getDeviceInfo();
      
      const { data, error } = await supabase.rpc('refresh_mobile_session', {
        p_token: token,
        p_device_info: deviceInfo
      });

      if (error) throw error;

      if (data) {
        await this.storeSession(data);
        this.currentSession = data;
        this.currentUser = data.founder;
        return data;
      }
      
      return null;
    } catch (error) {
      console.error('Error refreshing session:', error);
      // Clear invalid session
      await this.signOut();
      return null;
    }
  }

  // Register device token for push notifications
  async registerDeviceToken(expoPushToken) {
    try {
      if (!this.currentSession?.token) {
        throw new Error('No active session');
      }

      const { data, error } = await supabase.rpc('update_expo_push_token', {
        p_token: this.currentSession.token,
        p_expo_push_token: expoPushToken
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error registering device token:', error);
      throw error;
    }
  }

  // Sign out
  async signOut() {
    try {
      // Clear stored session
      await SecureStore.deleteItemAsync('auth_token');
      await AsyncStorage.removeItem('user_session');
      
      // Clear current session
      this.currentSession = null;
      this.currentUser = null;
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Get current session
  getCurrentSession() {
    return this.currentSession;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!(this.currentSession && this.currentUser);
  }

  // Get authenticated Supabase client with RLS context
  async getAuthenticatedClient() {
    if (!this.currentSession?.token) {
      throw new Error('No active session');
    }

    // Set RLS context for the founder
    await supabase.rpc('set_founder_context', {
      p_founder_id: this.currentUser.id
    });

    return supabase;
  }
}

export default new AuthService();
