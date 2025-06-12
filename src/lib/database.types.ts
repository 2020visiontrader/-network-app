export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

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
          email: string | null
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
          email?: string | null
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
          email?: string | null
        }
      }
      birthday_reminders: {
        Row: {
          id: string
          contact_id: string
          reminder_date: string
          reminder_sent: boolean
        }
        Insert: {
          id?: string
          contact_id: string
          reminder_date: string
          reminder_sent?: boolean
        }
        Update: {
          id?: string
          contact_id?: string
          reminder_date?: string
          reminder_sent?: boolean
        }
      }
      travel_checkins: {
        Row: {
          id: string
          user_id: string
          city: string
          checkin_date: string | null
          visible_to_others: boolean
        }
        Insert: {
          id?: string
          user_id: string
          city: string
          checkin_date?: string | null
          visible_to_others?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          city?: string
          checkin_date?: string | null
          visible_to_others?: boolean
        }
      }
      introductions: {
        Row: {
          id: string
          introduced_by_id: string | null
          contact_1_id: string
          contact_2_id: string
          intro_message: string | null
          status: 'pending' | 'accepted' | 'declined'
          created_at: string
        }
        Insert: {
          id?: string
          introduced_by_id?: string | null
          contact_1_id: string
          contact_2_id: string
          intro_message?: string | null
          status?: 'pending' | 'accepted' | 'declined'
          created_at?: string
        }
        Update: {
          id?: string
          introduced_by_id?: string | null
          contact_1_id?: string
          contact_2_id?: string
          intro_message?: string | null
          status?: 'pending' | 'accepted' | 'declined'
          created_at?: string
        }
      }
      coffee_chats: {
        Row: {
          id: string
          user_id: string
          city: string
          date_available: string
          public_visibility: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          city: string
          date_available: string
          public_visibility?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          city?: string
          date_available?: string
          public_visibility?: boolean
          created_at?: string
        }
      }
      waitlist: {
        Row: {
          id: string
          email: string
          name: string | null
          referrer_code: string | null
          status: 'pending' | 'approved' | 'declined'
          reason: string | null
          linkedin_url: string | null
          joined_at: string
          processed_at: string | null
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          referrer_code?: string | null
          status?: 'pending' | 'approved' | 'declined'
          reason?: string | null
          linkedin_url?: string | null
          joined_at?: string
          processed_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          referrer_code?: string | null
          status?: 'pending' | 'approved' | 'declined'
          reason?: string | null
          linkedin_url?: string | null
          joined_at?: string
          processed_at?: string | null
        }
      }
      announcements: {
        Row: {
          id: string
          title: string
          text: string
          visibility: boolean
          type: 'alert' | 'info' | 'warning' | 'maintenance'
          show_banner: boolean
          created_by: string
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          title: string
          text: string
          visibility?: boolean
          type?: 'alert' | 'info' | 'warning' | 'maintenance'
          show_banner?: boolean
          created_by: string
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          text?: string
          visibility?: boolean
          type?: 'alert' | 'info' | 'warning' | 'maintenance'
          show_banner?: boolean
          created_by?: string
          created_at?: string
          expires_at?: string | null
        }
      }
      usage_metrics: {
        Row: {
          id: string
          user_id: string
          event_type: 'coffee_chat' | 'event_rsvp' | 'mastermind_created' | 'intro_made' | 'event_hosted'
          timestamp: string
          metadata: Record<string, any> | null
        }
        Insert: {
          id?: string
          user_id: string
          event_type: 'coffee_chat' | 'event_rsvp' | 'mastermind_created' | 'intro_made' | 'event_hosted'
          timestamp?: string
          metadata?: Record<string, any> | null
        }
        Update: {
          id?: string
          user_id?: string
          event_type?: 'coffee_chat' | 'event_rsvp' | 'mastermind_created' | 'intro_made' | 'event_hosted'
          timestamp?: string
          metadata?: Record<string, any> | null
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          date: string
          time: string
          location: string | null
          creator_id: string
          type: 'workshop' | 'mastermind' | 'social' | 'charity' | 'launch'
          visibility: 'connections' | 'open_invite'
          max_attendees: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          date: string
          time: string
          location?: string | null
          creator_id: string
          type: 'workshop' | 'mastermind' | 'social' | 'charity' | 'launch'
          visibility?: 'connections' | 'open_invite'
          max_attendees?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          date?: string
          time?: string
          location?: string | null
          creator_id?: string
          type?: 'workshop' | 'mastermind' | 'social' | 'charity' | 'launch'
          visibility?: 'connections' | 'open_invite'
          max_attendees?: number | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
