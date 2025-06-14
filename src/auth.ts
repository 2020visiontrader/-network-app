import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

export type SignUpCredentials = {
  email: string;
  password: string;
  fullName: string;
  role?: 'member' | 'mentor' | 'mentee' | 'ambassador';
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export const authService = {
  signUp: async ({ email, password, fullName, role = 'member' }: SignUpCredentials) => {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    // Create user profile
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('founders')
        .insert({
          id: authData.user.id,
          email,
          full_name: fullName,
          company_name: role, // Use role as company_name for now
          role: 'founder' // Default role
        });

      if (profileError) {
        // Attempt to clean up the auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw profileError;
      }
    }

    return authData;
  },

  login: async ({ email, password }: LoginCredentials) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000/reset-password',
    });

    if (error) throw error;
  },

  updatePassword: async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  },

  // Get the current session
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // Subscribe to auth state changes
  onAuthStateChange: (callback: (event: 'SIGNED_IN' | 'SIGNED_OUT', session: any) => void) => {
    return supabase.auth.onAuthStateChange((event: any, session: any) => {
      callback(event as 'SIGNED_IN' | 'SIGNED_OUT', session);
    });
  }
};
