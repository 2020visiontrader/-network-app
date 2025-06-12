import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import type { Database as DB } from '@/lib/database.types';

export type Contact = DB['public']['Tables']['contacts']['Row'];
export type Interaction = any; // Replace 'any' with the actual type if available
export type Introduction = DB['public']['Tables']['introductions']['Row'];

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Initialize Supabase client
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// User API
export const userApi = {
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  updateProfile: async (profile: Partial<DB['public']['Tables']['users']['Update']>) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;

    const { data, error } = await supabase
      .from('users')
      .update(profile)
      .eq('id', user?.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  getUserProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }
};

// Contacts API
export const contactsApi = {
  getContacts: async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;

    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('owner_id', user?.id)
      .order('contact_name');

    if (error) throw error;
    return data;
  },

  addContact: async (contact: Omit<DB['public']['Tables']['contacts']['Insert'], 'id' | 'owner_id'>) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;

    const { data, error } = await supabase
      .from('contacts')
      .insert({ ...contact, owner_id: user?.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateContact: async (id: string, contact: Partial<DB['public']['Tables']['contacts']['Update']>) => {
    const { data, error } = await supabase
      .from('contacts')
      .update(contact)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteContact: async (id: string) => {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Introductions API
export const introductionsApi = {
  getIntroductions: async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;

    const { data, error } = await supabase
      .from('introductions')
      .select(`
        *,
        contact_1:contacts!contact_1_id(*),
        contact_2:contacts!contact_2_id(*)
      `)
      .eq('introduced_by_id', user?.id);

    if (error) throw error;
    return data;
  },

  createIntroduction: async (intro: Omit<DB['public']['Tables']['introductions']['Insert'], 'id' | 'introduced_by_id'>) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;

    const { data, error } = await supabase
      .from('introductions')
      .insert({ ...intro, introduced_by_id: user?.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Coffee Chats API
export const coffeeChatsApi = {
  getCoffeeChats: async (city?: string) => {
    let query = supabase
      .from('coffee_chats')
      .select('*, user:users(*)');
    
    if (city) {
      query = query.eq('city', city);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  createCoffeeChat: async (chat: Omit<DB['public']['Tables']['coffee_chats']['Insert'], 'id' | 'user_id'>) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;

    const { data, error } = await supabase
      .from('coffee_chats')
      .insert({ ...chat, user_id: user?.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Travel Check-ins API
export const travelApi = {
  getTravelCheckins: async (city?: string) => {
    let query = supabase
      .from('travel_checkins')
      .select('*, user:users(*)');
    
    if (city) {
      query = query.eq('city', city);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  createTravelCheckin: async (checkin: Omit<DB['public']['Tables']['travel_checkins']['Insert'], 'id' | 'user_id'>) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;

    const { data, error } = await supabase
      .from('travel_checkins')
      .insert({ ...checkin, user_id: user?.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Contact API functions
export const addContact = async (contact: Omit<Contact, 'id'>) => {
  const response = await fetch('/api/contacts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(contact),
  });
  
  if (!response.ok) {
    throw new Error('Failed to add contact');
  }
  
  return response.json();
};

export const updateContact = async (contact: Contact) => {
  const response = await fetch(`/api/contacts/${contact.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(contact),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update contact');
  }
  
  return response.json();
};

export const deleteContact = async (contactId: string) => {
  const response = await fetch(`/api/contacts/${contactId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete contact');
  }
};

export const logInteraction = async (interaction: Omit<Interaction, 'id'>) => {
  const response = await fetch('/api/interactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(interaction),
  });
  
  if (!response.ok) {
    throw new Error('Failed to log interaction');
  }
  
  return response.json();
};

// Introduction API functions
export const createIntroduction = async (introduction: Omit<Introduction, 'id'>) => {
  const response = await fetch('/api/introductions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(introduction),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create introduction');
  }
  
  return response.json();
};

export const updateIntroductionStatus = async (introductionId: string, status: Introduction['status']) => {
  const response = await fetch(`/api/introductions/${introductionId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update introduction status');
  }
  
  return response.json();
};
