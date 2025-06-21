// This utility file can be used to validate your Supabase interactions
// Use it to test specific database operations and ensure your app interacts correctly with Supabase

import { supabase } from '../services/supabase';

/**
 * Utility functions to test Supabase interactions
 * This helps ensure your app is correctly synchronized with the Supabase schema
 */
export class SupabaseSchemaValidator {
  /**
   * Validates the founders table schema by performing a test query
   */
  static async validateFoundersTable() {
    try {
      // Attempt to query the founders table with expected fields
      const { data, error } = await supabase
        .from('founders')
        .select(`
          id,
          user_id,
          email,
          full_name,
          company_name,
          role,
          linkedin_url,
          location_city,
          industry,
          onboarding_completed,
          profile_progress
        `)
        .limit(1);
      
      if (error) {
        console.error('Founders table validation failed:', error);
        return { success: false, error: error.message };
      }
      
      console.log('Founders table validation successful');
      return { success: true, data };
    } catch (error) {
      console.error('Error validating founders table:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Validates the connections table schema by performing a test query
   */
  static async validateConnectionsTable() {
    try {
      // Attempt to query the connections table with expected fields
      const { data, error } = await supabase
        .from('connections')
        .select(`
          id,
          founder_a_id,
          founder_b_id,
          status,
          source,
          created_at
        `)
        .limit(1);
      
      if (error) {
        console.error('Connections table validation failed:', error);
        return { success: false, error: error.message };
      }
      
      console.log('Connections table validation successful');
      return { success: true, data };
    } catch (error) {
      console.error('Error validating connections table:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Validates the coffee_chats table schema by performing a test query
   */
  static async validateCoffeeChatsTable() {
    try {
      // Attempt to query the coffee_chats table with expected fields
      const { data, error } = await supabase
        .from('coffee_chats')
        .select(`
          id,
          user_id,
          partner_id,
          status,
          scheduled_at,
          created_at
        `)
        .limit(1);
      
      if (error) {
        console.error('Coffee chats table validation failed:', error);
        return { success: false, error: error.message };
      }
      
      console.log('Coffee chats table validation successful');
      return { success: true, data };
    } catch (error) {
      console.error('Error validating coffee_chats table:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Validates that Supabase functions are working correctly
   */
  static async validateSupabaseFunctions() {
    try {
      // Test the LinkedIn URL validation function
      const { data: isValid, error } = await supabase.rpc(
        'is_valid_linkedin_url',
        { url: 'https://linkedin.com/in/testuser' }
      );
      
      if (error) {
        console.error('Function validation failed:', error);
        return { success: false, error: error.message };
      }
      
      console.log('Function validation successful:', isValid);
      return { success: true, data: { isValid } };
    } catch (error) {
      console.error('Error validating Supabase functions:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Tests RLS policies by attempting operations as an authenticated user
   * Note: This requires an authenticated session to test properly
   */
  static async validateRLSPolicies(userId: string): Promise<RLSValidationResult> {
    try {
      // Test select policy on own profile
      const { data: ownProfile, error: ownProfileError } = await supabase
        .from('founders')
        .select('*')
        .eq('id', userId)
        .single();
      
      // Test update policy on own profile
      const { error: updateError } = await supabase
        .from('founders')
        .update({ profile_progress: 100 })
        .eq('id', userId);
      
      // Test RLS for connections
      const { data: connections, error: connectionsError } = await supabase
        .from('connections')
        .select('*')
        .or(`founder_a_id.eq.${userId},founder_b_id.eq.${userId}`);
      
      // Test RLS for coffee chats
      const { data: coffeeChats, error: coffeeChatsError } = await supabase
        .from('coffee_chats')
        .select('*')
        .or(`user_id.eq.${userId},partner_id.eq.${userId}`);
      
      const results = {
        canSelectOwnProfile: !ownProfileError,
        canUpdateOwnProfile: !updateError,
        canViewOwnConnections: !connectionsError,
        canViewOwnCoffeeChats: !coffeeChatsError,
        errors: {
          ownProfileError: ownProfileError?.message,
          updateError: updateError?.message,
          connectionsError: connectionsError?.message,
          coffeeChatsError: coffeeChatsError?.message
        }
      };
      
      console.log('RLS policy validation results:', results);
      return { 
        success: !ownProfileError && !updateError && !connectionsError && !coffeeChatsError,
        data: results
      };
    } catch (error) {
      console.error('Error validating RLS policies:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Run all validation tests and return results
   */
  static async validateAll(userId) {
    const foundersResult = await this.validateFoundersTable();
    const connectionsResult = await this.validateConnectionsTable();
    const coffeeChatsResult = await this.validateCoffeeChatsTable();
    const functionsResult = await this.validateSupabaseFunctions();
    
    let rlsResult: RLSValidationResult = { success: false, error: 'Not tested - requires authenticated user' };
    if (userId) {
      rlsResult = await this.validateRLSPolicies(userId);
    }
    
    return {
      foundersTable: foundersResult,
      connectionsTable: connectionsResult,
      coffeeChatsTable: coffeeChatsResult,
      functions: functionsResult,
      rlsPolicies: rlsResult,
      allValid: foundersResult.success && 
                connectionsResult.success && 
                coffeeChatsResult.success && 
                functionsResult.success &&
                (userId ? rlsResult.success : true)
    };
  }
}

// Add near the top of the file
interface RLSValidationResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}

// Example usage:
// 
// import { SupabaseSchemaValidator } from './utils/SupabaseSchemaValidator';
// 
// // Run all validation checks
// const results = await SupabaseSchemaValidator.validateAll(user?.id);
// console.log('Schema validation results:', results);
// 
// if (results.allValid) {
//   console.log('✅ Your app is fully synchronized with Supabase schema!');
// } else {
//   console.error('❌ Schema synchronization issues detected. Check logs for details.');
// }
