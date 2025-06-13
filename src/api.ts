import { createClient } from '@supabase/supabase-js';
import { Database } from '../lib/database.types';
import type { Database as DB } from '../lib/database.types';

// Use correct table names from mobile founder schema
export type Connection = DB['public']['Tables']['connections']['Row'];
export type Founder = DB['public']['Tables']['founders']['Row'];
export type CoffeeChat = DB['public']['Tables']['coffee_chats']['Row'];
export type Event = DB['public']['Tables']['events']['Row'];

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

  updateProfile: async (profile: Partial<DB['public']['Tables']['founders']['Update']>) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('founders')
      .update(profile)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  getUserProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('founders')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }
};

// Connections API
export const connectionsApi = {
  getConnections: async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('connections')
      .select(`
        *,
        founder_a:founder_a_id(name, email, company, location, bio),
        founder_b:founder_b_id(name, email, company, location, bio)
      `)
      .or(`founder_a_id.eq.${user.id},founder_b_id.eq.${user.id}`)
      .eq('status', 'active');

    if (error) throw error;
    return data;
  },

  createConnection: async (founderId: string) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('connections')
      .insert({
        founder_a_id: user.id,
        founder_b_id: founderId,
        connection_source: 'app',
        status: 'pending',
        connected_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Coffee Chats API
export const coffeeChatsApi = {
  getCoffeeChats: async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('coffee_chats')
      .select(`
        *,
        requester:requester_id(name, email, company),
        requested:requested_id(name, email, company)
      `)
      .or(`requester_id.eq.${user.id},requested_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  createCoffeeChat: async (coffeeChat: {
    requested_id: string;
    proposed_time: string;
    meeting_type: 'virtual' | 'in-person';
    location_or_link?: string;
    requester_message?: string;
    duration_minutes: number;
  }) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('coffee_chats')
      .insert({
        requester_id: user.id,
        requested_id: coffeeChat.requested_id,
        proposed_time: coffeeChat.proposed_time,
        meeting_type: coffeeChat.meeting_type,
        location_or_link: coffeeChat.location_or_link,
        requester_message: coffeeChat.requester_message,
        status: 'pending',
        duration_minutes: coffeeChat.duration_minutes
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Events API
export const eventsApi = {
  getEvents: async () => {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        creator:created_by(name, email, company)
      `)
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data;
  },

  createEvent: async (event: {
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    location?: string;
    event_type: 'networking' | 'workshop' | 'social' | 'other';
    max_attendees?: number;
  }) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('events')
      .insert({
        ...event,
        created_by: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Notifications API
export const notificationsApi = {
  getNotifications: async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('founder_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};
