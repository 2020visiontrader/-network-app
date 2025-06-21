// Database Health Check Utility
// This runs in production to verify database connectivity and schema
import { supabase } from './supabase';

export class DatabaseHealthCheck {
  static async checkConnection() {
    try {
      const { data, error } = await supabase
        .from('founders')
        .select('count')
        .limit(1);
      
      if (error) throw error;
      return { status: 'connected', message: 'Database connection successful' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  static async checkSchema() {
    try {
      const requiredColumns = [
        'id', 'email', 'full_name', 'linkedin_url', 'location_city',
        'industry', 'company_name', 'role', 'bio', 'tags_or_interests',
        'profile_visible', 'onboarding_completed', 'profile_progress'
      ];

      // Try to select all required columns
      const { data, error } = await supabase
        .from('founders')
        .select(requiredColumns.join(','))
        .limit(1);

      if (error) {
        if (error.code === '42703') {
          return { 
            status: 'schema_missing', 
            message: 'Required columns missing from founders table',
            error: error.message 
          };
        }
        throw error;
      }

      return { status: 'schema_ok', message: 'All required columns present' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  static async checkUserOnboarding(userId) {
    try {
      const { data, error } = await supabase
        .from('founders')
        .select('onboarding_completed, profile_progress')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { status: 'no_profile', message: 'User profile not found' };
        }
        throw error;
      }

      return {
        status: 'found',
        onboarding_completed: data.onboarding_completed,
        profile_progress: data.profile_progress
      };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  static async runFullCheck(userId = null) {
    const results = {
      connection: await this.checkConnection(),
      schema: await this.checkSchema(),
    };

    if (userId) {
      results.user = await this.checkUserOnboarding(userId);
    }

    return results;
  }
}
