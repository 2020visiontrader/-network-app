// This file defines TypeScript interfaces that match your Supabase schema
// Update these interfaces based on the results of the database_schema_verification.sql script

export interface Database {
  public: {
    Tables: {
      founders: {
        Row: Founder;
        Insert: Omit<Founder, 'created_at' | 'updated_at'> & { created_at?: string; updated_at?: string };
        Update: Partial<Omit<Founder, 'id' | 'created_at' | 'updated_at'>> & { updated_at?: string };
      };
      users: {
        Row: User;
        Insert: Omit<User, 'created_at'> & { created_at?: string };
        Update: Partial<Omit<User, 'id' | 'created_at'>>;
      };
      connections: {
        Row: Connection;
        Insert: Omit<Connection, 'id' | 'connected_at'> & { connected_at?: string };
        Update: Partial<Omit<Connection, 'id' | 'connected_at'>>;
      };
      masterminds: {
        Row: Mastermind;
        Insert: Omit<Mastermind, 'id' | 'created_at'> & { created_at?: string };
        Update: Partial<Omit<Mastermind, 'id' | 'created_at'>>;
      };
      location_shares: {
        Row: LocationShare;
        Insert: Omit<LocationShare, 'id' | 'updated_at'> & { updated_at?: string };
        Update: Partial<Omit<LocationShare, 'id' | 'updated_at'>> & { updated_at?: string };
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'> & { created_at?: string };
        Update: Partial<Omit<Notification, 'id' | 'created_at'>>;
      };
      travel_plans: {
        Row: TravelPlan;
        Insert: Omit<TravelPlan, 'id' | 'created_at'> & { created_at?: string };
        Update: Partial<Omit<TravelPlan, 'id' | 'created_at'>>;
      };
      event_hosting: {
        Row: EventHosting;
        Insert: Omit<EventHosting, 'id' | 'created_at'> & { created_at?: string };
        Update: Partial<Omit<EventHosting, 'id' | 'created_at'>>;
      };
      event_attendees: {
        Row: EventAttendee;
        Insert: Omit<EventAttendee, 'id' | 'rsvp_date'> & { rsvp_date?: string };
        Update: Partial<Omit<EventAttendee, 'id' | 'rsvp_date'>>;
      };
      coffee_chats: {
        Row: CoffeeChat;
        Insert: Omit<CoffeeChat, 'id' | 'created_at'> & { created_at?: string };
        Update: Partial<Omit<CoffeeChat, 'id' | 'created_at'>>;
      };
    };
    Functions: {
      upsert_founder_onboarding: {
        Args: { p_user_id: string; user_email: string; founder_data: any };
        Returns: string;
      };
      is_valid_linkedin_url: {
        Args: { url: string };
        Returns: boolean;
      };
      is_onboarding_complete: {
        Args: { p_user_id: string };
        Returns: boolean;
      };
    };
  };
}

// Define the interface for the Founder table
export interface Founder {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  company_name: string;
  role: string;
  company_stage?: string;
  industry?: string;
  tagline?: string;
  bio?: string;
  profile_photo_url?: string;
  location_city?: string;
  location_country?: string;
  linkedin_url?: string;
  twitter_handle?: string;
  company_website?: string;
  is_verified?: boolean;
  is_active?: boolean;
  member_number?: number;
  onboarding_completed: boolean;
  onboarding_step?: number;
  created_at: string;
  last_active?: string;
  updated_at: string;
  profile_progress?: number;
  tags_or_interests?: string[];
  profile_visible?: boolean;
  password_hash?: string;
}

// Define the interface for the User table
export interface User {
  id: string;
  email: string;
  created_at: string;
  // Add other fields based on your schema
}

// Define the interface for the Connection table
export interface Connection {
  id: string;
  founder_a_id: string;
  founder_b_id: string;
  status?: string;
  connected_at: string;
  // Add other fields based on your schema
}

// Define the interface for the Mastermind table
export interface Mastermind {
  id: string;
  name: string;
  description?: string;
  creator_id: string;
  created_at: string;
  // Add other fields based on your schema
}

// Define the interface for the LocationShare table
export interface LocationShare {
  id: string;
  founder_id: string;
  latitude: number;
  longitude: number;
  location_name?: string;
  is_visible: boolean;
  updated_at: string;
  // Add other fields based on your schema
}

// Define the interface for the Notification table
export interface Notification {
  id: string;
  recipient_id: string;
  sender_id?: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  related_entity_id?: string;
  related_entity_type?: string;
  // Add other fields based on your schema
}

// Define the interface for the TravelPlan table
export interface TravelPlan {
  id: string;
  founder_id: string;
  destination_city: string;
  destination_country?: string;
  arrival_date: string;
  departure_date: string;
  purpose?: string;
  is_public: boolean;
  created_at: string;
  // Add other fields based on your schema
}

// Define the interface for the EventHosting table
export interface EventHosting {
  id: string;
  host_id: string;
  title: string;
  description?: string;
  event_date: string;
  location?: string;
  max_attendees?: number;
  is_public: boolean;
  created_at: string;
  // Add other fields based on your schema
}

// Define the interface for the EventAttendee table
export interface EventAttendee {
  id: string;
  event_id: string;
  founder_id: string;
  status: string;
  rsvp_date: string;
  // Add other fields based on your schema
}

// Define the interface for the CoffeeChat table
export interface CoffeeChat {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: string;
  message?: string;
  proposed_times?: string[];
  confirmed_time?: string;
  location?: string;
  is_virtual: boolean;
  created_at: string;
  // Add other fields based on your schema
}

// Use this helper function to define a type for Supabase query results
export type SupabaseQueryResult<T> = {
  data: T | null;
  error: Error | null;
};
