// Founder API Service
// Real production service for founder-related database operations
import { supabase } from './supabase';

interface FounderData {
  id?: string;
  email: string;
  full_name: string;
  linkedin_url?: string;
  location_city?: string;
  industry?: string;
  company_name?: string;
  role?: string;
  bio?: string;
  tags_or_interests?: string;
  profile_visible?: boolean;
  onboarding_completed?: boolean;
  profile_progress?: number;
  created_at?: string;
  updated_at?: string;
}

interface FounderFilters {
  industry?: string;
  location_city?: string;
  role?: string;
  limit?: number;
  search?: string;
  visible_only?: boolean;
}

interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
}

export class FounderService {
  static async createFounder(founderData: Partial<FounderData>): Promise<ServiceResponse<FounderData>> {
    try {
      const { data, error } = await supabase
        .from('founders')
        .insert([founderData])
        .select()
        .maybeSingle(); // ✅ Avoids PGRST116 error

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Founder profile created successfully'
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorCode = error && typeof error === 'object' && 'code' in error ? (error as { code: string }).code : undefined;
      return {
        success: false,
        error: errorMessage,
        code: errorCode
      };
    }
  }

  static async updateFounder(founderId: string, updates: Partial<FounderData>): Promise<ServiceResponse<FounderData>> {
    try {
      const { data, error } = await supabase
        .from('founders')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', founderId)
        .select()
        .maybeSingle(); // ✅ Avoids PGRST116 error

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Founder profile updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  static async upsertFounder(founderData) {
    try {
      // Check if founder exists by email
      const { data: existingFounder, error: checkError } = await supabase
        .from('founders')
        .select('*')
        .eq('email', founderData.email)
        .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      let result;
      if (existingFounder) {
        // Update existing founder
        result = await this.updateFounder(existingFounder.id, founderData);
      } else {
        // Create new founder
        result = await this.createFounder(founderData);
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  static async getFounder(founderId) {
    try {
      const { data, error } = await supabase
        .from('founders')
        .select('*')
        .eq('id', founderId)
        .maybeSingle(); // ✅ Avoids PGRST116 error

      if (error) {
        console.error('[Founder Fetch Error]', error.message);
        return {
          success: false,
          error: error.message,
          code: error.code
        };
      }

      if (!data) {
        console.warn('[Founder Missing] No profile found for founder ID:', founderId);
        return {
          success: false,
          error: 'Founder not found',
          code: 'NOT_FOUND'
        };
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  static async getFounderByEmail(email) {
    try {
      const { data, error } = await supabase
        .from('founders')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        return {
          success: false,
          error: 'Founder not found',
          code: 'NOT_FOUND'
        };
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  static async completeOnboarding(founderId, onboardingData) {
    try {
      const updates = {
        ...onboardingData,
        onboarding_completed: true,
        profile_progress: 100,
        updated_at: new Date().toISOString()
      };

      return await this.updateFounder(founderId, updates);
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  static async getFounders(filters: FounderFilters = {}) {
    try {
      let query = supabase
        .from('founders')
        .select('*')
        .eq('profile_visible', true)
        .eq('onboarding_completed', true);

      // Apply filters
      if (filters.industry) {
        query = query.eq('industry', filters.industry);
      }

      if (filters.location_city) {
        query = query.eq('location_city', filters.location_city);
      }

      if (filters.role) {
        query = query.eq('role', filters.role);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        success: true,
        data,
        count: data.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  static async searchFounders(searchTerm) {
    try {
      const { data, error } = await supabase
        .from('founders')
        .select('*')
        .eq('profile_visible', true)
        .eq('onboarding_completed', true)
        .or(`full_name.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`);

      if (error) throw error;

      return {
        success: true,
        data,
        count: data.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  static async deleteFounder(founderId) {
    try {
      const { error } = await supabase
        .from('founders')
        .delete()
        .eq('id', founderId);

      if (error) throw error;

      return {
        success: true,
        message: 'Founder profile deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  static async upsertFounderOnboarding(userId, userEmail, founderData) {
    try {
      console.log('Upserting founder onboarding data:', { userId, userEmail });
      
      // First check if we have an existing user with this email
      const { data: existingFounder, error: checkError } = await supabase
        .from('founders')
        .select('*')
        .eq('email', userEmail)
        .maybeSingle();
        
      if (checkError) {
        console.error('Error checking for existing founder:', checkError);
        // Continue with the operation, don't throw
      }
      
      if (existingFounder) {
        console.log('Found existing founder record:', existingFounder.id);
      }
      
      // ALWAYS ensure these fields are set for proper onboarding completion
      const enhancedFounderData = {
        ...founderData,
        onboarding_completed: true,  // Force this to be true regardless of input
        profile_progress: 100,       // Force this to be 100 regardless of input
        updated_at: new Date().toISOString()
      };
      
      // Try to use the database function for reliable onboarding upsert
      try {
        console.log('Attempting to use database function for onboarding...');
        const { data, error } = await supabase.rpc('upsert_founder_onboarding', {
          user_id: userId,
          user_email: userEmail,
          founder_data: enhancedFounderData
        });

        if (error) {
          console.error('Database function error:', error);
          throw error;
        }

        console.log('Successfully used database function for onboarding');
        
        // Double-check that onboarding status was updated
        const { data: checkData, error: checkStatusError } = await supabase
          .from('founders')
          .select('onboarding_completed, profile_progress')
          .eq('id', userId)
          .maybeSingle(); // ✅ Avoids PGRST116 error
          
        if (checkStatusError) {
          console.error('Error checking onboarding status:', checkStatusError);
          
          // Even if check fails, try a direct update as a fallback
          const { error: directUpdateError } = await supabase
            .from('founders')
            .update({ 
              onboarding_completed: true,
              profile_progress: 100,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);
            
          if (directUpdateError) {
            console.error('Error in direct update fallback:', directUpdateError);
          } else {
            console.log('Direct update fallback successful');
          }
        } else {
          console.log('Verified onboarding status:', checkData);
          
          // If onboarding_completed isn't set, force an update
          if (!checkData.onboarding_completed) {
            console.log('onboarding_completed not set - forcing update');
            
            const { error: forceUpdateError } = await supabase
              .from('founders')
              .update({ 
                onboarding_completed: true,
                profile_progress: 100,
                updated_at: new Date().toISOString()
              })
              .eq('id', userId);
              
            if (forceUpdateError) {
              console.error('Error in forced update:', forceUpdateError);
            } else {
              console.log('Forced update successful');
            }
          }
        }
        
        return {
          success: true,
          data: { id: data },
          message: 'Onboarding completed successfully'
        };
      } catch (rpcError) {
        console.log('Database function failed, falling back to manual upsert:', rpcError.message);
        
        // If function doesn't exist or fails, use manual upsert
        const enhancedData = {
          ...founderData,
          id: userId,
          email: userEmail,
          onboarding_completed: true,  // FORCE this to true
          profile_progress: 100,       // FORCE this to 100
          updated_at: new Date().toISOString()
        };

        // For debugging
        console.log('Manual upsert data:', enhancedData);

        let result;
        // If we found an existing record, make sure to use the right ID
        if (existingFounder) {
          console.log('Updating existing founder with ID:', existingFounder.id);
          
          // Direct update to ensure critical fields are set
          const { error: directError } = await supabase
            .from('founders')
            .update({
              ...enhancedData,
              onboarding_completed: true,  // Force this again to be sure
              profile_progress: 100        // Force this again to be sure
            })
            .eq('id', existingFounder.id);
            
          if (directError) {
            console.error('Direct update error:', directError);
            // Fall back to our service method
            result = await this.updateFounder(existingFounder.id, enhancedData);
          } else {
            console.log('Direct update successful');
            result = { 
              success: true, 
              data: { id: existingFounder.id },
              message: 'Onboarding updated successfully via direct update'
            };
          }
        } else {
          console.log('Creating new founder with ID:', userId);
          
          // Try direct insert first
          const { data: insertData, error: insertError } = await supabase
            .from('founders')
            .insert({
              ...enhancedData,
              onboarding_completed: true,  // Force this again
              profile_progress: 100        // Force this again
            })
            .select();
            
          if (insertError) {
            console.error('Direct insert error:', insertError);
            // Fall back to our service method
            result = await this.createFounder(enhancedData);
          } else {
            console.log('Direct insert successful');
            result = { 
              success: true, 
              data: insertData[0],
              message: 'Onboarding created successfully via direct insert'
            };
          }
        }
        
        // Double-check that onboarding status was updated
        const { data: checkData, error: checkStatusError } = await supabase
          .from('founders')
          .select('onboarding_completed, profile_progress')
          .eq('id', userId)
          .maybeSingle(); // ✅ Avoids PGRST116 error
          
        if (checkStatusError) {
          console.error('Error checking onboarding status after manual update:', checkStatusError);
        } else {
          console.log('Verified onboarding status after manual update:', checkData);
        }
        
        return result;
      }
    } catch (error) {
      console.error('Error in upsertFounderOnboarding:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }
}
