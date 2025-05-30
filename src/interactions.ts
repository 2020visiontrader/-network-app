import { Database } from './types';
import { supabase } from './api';

export type Interaction = Database['public']['Tables']['interactions']['Row'];
export type InteractionInsert = Database['public']['Tables']['interactions']['Insert'];

export const interactionsApi = {
  // Log a new interaction
  logInteraction: async (interaction: Omit<InteractionInsert, 'id' | 'user_id'>) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;

    const { data, error } = await supabase
      .from('interactions')
      .insert({
        ...interaction,
        user_id: user?.id,
      })
      .select('*, contact:contacts(*)')
      .single();

    if (error) throw error;
    return data;
  },

  // Get interactions for a specific contact
  getContactInteractions: async (contactId: string) => {
    const { data, error } = await supabase
      .from('interactions')
      .select('*')
      .eq('contact_id', contactId)
      .order('interaction_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get all interactions for the current user's contacts
  getUserInteractions: async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;

    const { data, error } = await supabase
      .from('interactions')
      .select(`
        *,
        contact:contacts(
          id,
          contact_name,
          relationship_type
        )
      `)
      .eq('user_id', user?.id)
      .order('interaction_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get contacts that need interaction (due for nudge)
  getDueContacts: async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;

    const { data, error } = await supabase
      .rpc('get_due_contacts', {
        user_id: user?.id
      });

    if (error) throw error;
    return data;
  },

  // Update interaction
  updateInteraction: async (id: string, updates: Partial<InteractionInsert>) => {
    const { data, error } = await supabase
      .from('interactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete interaction
  deleteInteraction: async (id: string) => {
    const { error } = await supabase
      .from('interactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
