// Authentication Helper Utility
// Real production utility for auth operations
import { supabase } from './supabase';

export class AuthHelper {
  static async signUp(email, password, additionalData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: additionalData
        }
      });

      if (error) throw error;

      return {
        success: true,
        user: data.user,
        session: data.session,
        message: 'Account created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.status
      };
    }
  }

  static async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      return {
        success: true,
        user: data.user,
        session: data.session,
        message: 'Signed in successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.status
      };
    }
  }

  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      return {
        success: true,
        message: 'Signed out successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;

      return {
        success: true,
        message: 'Password reset email sent'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;

      return {
        success: true,
        user
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      return {
        success: true,
        session
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Redirecting to Google...'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password) {
    return {
      isValid: password.length >= 6,
      minLength: password.length >= 6,
      hasNumber: /\d/.test(password),
      hasLetter: /[a-zA-Z]/.test(password)
    };
  }
}
