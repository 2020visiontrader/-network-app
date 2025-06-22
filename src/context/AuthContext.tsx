import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

interface UserData {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  preferred_name?: string;
  company_name?: string;
  role?: string;
  industry?: string;
  location_city?: string;
  bio?: string;
  linkedin_url?: string;
  tags_or_interests?: string[];
  onboarding_completed?: boolean;
  profile_visible?: boolean;
  profile_progress?: number;
  status?: 'active' | 'pending' | 'suspended';
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown; // For any other properties, using unknown for better type safety
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  session: Session | null;
  loading: boolean;
  isLoading: boolean; // Alias for loading
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
  updateUserData: (data: Partial<UserData>) => Promise<any>;
  checkEmailExists: (email: string) => Promise<boolean>;
  refreshUserData: () => Promise<UserData | null>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialized, setInitialized] = useState<boolean>(false);

  // Initialize auth state on app start
  useEffect(() => {
    initializeAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (session?.user) {
          setUser(session.user);
          setSession(session);
          await fetchUserData(session.user.id);
        } else {
          console.log('Clearing user from auth state change');
          setUser(null);
          setSession(null);
          setUserData(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserData = async (userId: string): Promise<UserData | null> => {
    try {
      console.log('Fetching user data for userId:', userId);
      
      const { data, error } = await supabase
        .from('founders')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      console.log('Fetch user data result:', { data, error });

      if (error) {
        if (error.code === 'PGRST116') {
          // User not found in founders table - this is normal for new users before profile creation
          console.log('User not found in founders table (normal for new users)');
          setUserData(null);
          return null;
        }
        throw error;
      }
      
      console.log('Setting user data:', data);
      setUserData(data);
      return data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserData(null);
      return null;
    }
  };

  const initializeAuth = async () => {
    try {
      setLoading(true);
      
      // Get the current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        await fetchUserData(session.user.id);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: password,
      });

      if (error) throw error;
      
      // Auth state change will be handled by the listener
      return { success: true, data };
    } catch (error) {
      console.error('Sign in error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sign in failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Sign up the user with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password: password,
      });

      if (signUpError || !authData.user) {
        throw signUpError || new Error('Sign up failed');
      }

      console.log('User signed up successfully, will direct to onboarding:', authData.user.id);
      
      // No longer creating a profile here - will redirect to onboarding
      return { success: true, data: authData };
    } catch (error) {
      console.error('Sign up error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sign up failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Auth state change will be handled by the listener
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim());
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Password reset failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const updateUserData = async (data: Partial<UserData>) => {
    try {
      if (!user?.id) throw new Error('No user logged in');
      
      const { error } = await supabase
        .from('founders')
        .update(data)
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Refresh user data after update
      await refreshUserData();
      
      return { success: true };
    } catch (error) {
      console.error('Update user data error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update user data' 
      };
    }
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      // This is a simple check - in production you might want a more secure method
      const { data, error } = await supabase
        .from('founders')
        .select('email')
        .eq('email', email.toLowerCase().trim())
        .limit(1);
      
      if (error) throw error;
      return (data?.length || 0) > 0;
    } catch (error) {
      console.error('Check email error:', error);
      return false;
    }
  };

  const refreshUserData = async () => {
    if (user?.id) {
      console.log('Refreshing user data for user ID:', user.id);
      try {
        // Force a small delay to ensure database has time to update
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Get the latest user data from the database
        const { data, error } = await supabase
          .from('founders')
          .select('*')
          .eq('id', user.id)
          .maybeSingle(); // ✅ Avoids PGRST116 error

        if (error) {
          console.error('[Profile Fetch Error]', error.message);
          setUserData(null);
          return null;
        }

        if (!data) {
          console.log('[Profile Missing] User not found in founders table (normal for new users)');
          setUserData(null);
          return null;
        }
        
        console.log('Setting refreshed user data:', data);
        setUserData(data);
        return data;
      } catch (error) {
        console.error('Error refreshing user data:', error);
        return null;
      }
    } else {
      console.log('Cannot refresh user data - no user ID available');
      return null;
    }
  };

  const value: AuthContextType = {
    user,
    userData,
    session,
    loading,
    isLoading: loading, // Alias for loading
    initialized,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUserData,
    checkEmailExists,
    refreshUserData,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
