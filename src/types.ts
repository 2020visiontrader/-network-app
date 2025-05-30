export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ReminderFrequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          preferred_name: string | null
          role: 'member' | 'mentor' | 'mentee' | 'ambassador'
          city: string | null
          niche_tags: string[] | null
          birthday: string | null
          profile_visibility: boolean
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          preferred_name?: string | null
          role?: 'member' | 'mentor' | 'mentee' | 'ambassador'
          city?: string | null
          niche_tags?: string[] | null
          birthday?: string | null
          profile_visibility?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          preferred_name?: string | null
          role?: 'member' | 'mentor' | 'mentee' | 'ambassador'
          city?: string | null
          niche_tags?: string[] | null
          birthday?: string | null
          profile_visibility?: boolean
          created_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          owner_id: string
          contact_name: string
          relationship_type: string | null
          notes: string | null
          last_interaction_date: string | null
          birthdate: string | null
          reminder_frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | null
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          contact_name: string
          relationship_type?: string | null
          notes?: string | null
          last_interaction_date?: string | null
          birthdate?: string | null
          reminder_frequency?: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | null
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          contact_name?: string
          relationship_type?: string | null
          notes?: string | null
          last_interaction_date?: string | null
          birthdate?: string | null
          reminder_frequency?: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | null
          created_at?: string
        }
      }
      introductions: {
        Row: {
          id: string
          introduced_by_id: string | null
          contact_1_id: string | null
          contact_2_id: string | null
          intro_message: string | null
          status: 'pending' | 'accepted' | 'declined'
          created_at: string
        }
        Insert: {
          id?: string
          introduced_by_id?: string | null
          contact_1_id?: string | null
          contact_2_id?: string | null
          intro_message?: string | null
          status?: 'pending' | 'accepted' | 'declined'
          created_at?: string
        }
        Update: {
          id?: string
          introduced_by_id?: string | null
          contact_1_id?: string | null
          contact_2_id?: string | null
          intro_message?: string | null
          status?: 'pending' | 'accepted' | 'declined'
          created_at?: string
        }
      }
      birthday_reminders: {
        Row: {
          id: string
          contact_id: string
          reminder_date: string | null
          reminder_sent: boolean
        }
        Insert: {
          id?: string
          contact_id: string
          reminder_date?: string | null
          reminder_sent?: boolean
        }
        Update: {
          id?: string
          contact_id?: string
          reminder_date?: string | null
          reminder_sent?: boolean
        }
      }
      coffee_chats: {
        Row: {
          id: string
          user_id: string
          city: string
          date_available: string | null
          public_visibility: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          city: string
          date_available?: string | null
          public_visibility?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          city?: string
          date_available?: string | null
          public_visibility?: boolean
          created_at?: string
        }
      }
      travel_checkins: {
        Row: {
          id: string
          user_id: string
          city: string
          checkin_date: string
          visible_to_others: boolean
        }
        Insert: {
          id?: string
          user_id: string
          city: string
          checkin_date?: string
          visible_to_others?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          city?: string
          checkin_date?: string
          visible_to_others?: boolean
        }
      }
      interactions: {
        Row: {
          id: string
          contact_id: string
          user_id: string
          interaction_type: string
          notes: string | null
          interaction_date: string
          created_at: string
        }
        Insert: {
          id?: string
          contact_id: string
          user_id?: string
          interaction_type: string
          notes?: string | null
          interaction_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          contact_id?: string
          user_id?: string
          interaction_type?: string
          notes?: string | null
          interaction_date?: string
          created_at?: string
        }
      }
    }
    Views: {
      contacts_due_for_nudge: {
        Row: {
          id: string
          owner_id: string
          contact_name: string
          relationship_type: string | null
          notes: string | null
          last_interaction_date: string | null
          birthdate: string | null
          reminder_frequency: ReminderFrequency | null
          created_at: string
          owner_email: string
          owner_name: string
          next_interaction_due: string
          is_overdue: boolean
        }
      }
    }
    Functions: {
      get_due_contacts: {
        Args: {
          user_id: string
        }
        Returns: {
          contact_id: string
          contact_name: string
          last_interaction_date: string
          days_overdue: number
          reminder_frequency: ReminderFrequency
        }[]
      }
    }
  }
}

export type Contact = {
  id: string;
  name: string;
  relationship_type: string;
  notes?: string;
  birthday?: string;
  reminder_frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  last_interaction_date?: string;
  user_id: string;
};

export type Interaction = {
  id: string;
  contact_id: string;
  type: 'meeting' | 'call' | 'message' | 'other';
  notes?: string;
  date: string;
  user_id: string;
};

export type Introduction = {
  id?: string;
  contact1_id: string;
  contact2_id: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at?: string;
  user_id?: string;
};

export type User = {
  id: string;
  email: string;
  full_name: string;
  preferred_name?: string;
  role: 'member' | 'mentor' | 'mentee' | 'ambassador' | 'admin';
  city?: string;
  interests?: string[];
  created_at: string;
};

export type CoffeeChat = {
  id: string;
  user_id: string;
  city: string;
  availability_date: string;
  is_visible: boolean;
  created_at: string;
};

export type TravelCheckin = {
  id: string;
  user_id: string;
  city: string;
  start_date?: string;
  end_date?: string;
  is_visible: boolean;
  created_at: string;
};
