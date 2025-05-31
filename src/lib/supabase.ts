import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          referral_code: string | null
          status: 'pending' | 'active' | 'suspended'
          is_ambassador: boolean
          profile_progress: number
          last_login: string | null
          created_at: string
          updated_at: string
          linkedin_url: string | null
          tagline: string | null
          niche: string | null
          avatar_url: string | null
        }
        Insert: {
          id?: string
          email: string
          name: string
          referral_code?: string | null
          status?: 'pending' | 'active' | 'suspended'
          is_ambassador?: boolean
          profile_progress?: number
          last_login?: string | null
          created_at?: string
          updated_at?: string
          linkedin_url?: string | null
          tagline?: string | null
          niche?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          referral_code?: string | null
          status?: 'pending' | 'active' | 'suspended'
          is_ambassador?: boolean
          profile_progress?: number
          last_login?: string | null
          created_at?: string
          updated_at?: string
          linkedin_url?: string | null
          tagline?: string | null
          niche?: string | null
          avatar_url?: string | null
        }
      }
      connections: {
        Row: {
          id: string
          initiator_id: string
          receiver_id: string
          status: 'pending' | 'accepted' | 'declined'
          type: 'direct' | 'intro' | 'referral'
          intro_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          initiator_id: string
          receiver_id: string
          status?: 'pending' | 'accepted' | 'declined'
          type?: 'direct' | 'intro' | 'referral'
          intro_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          initiator_id?: string
          receiver_id?: string
          status?: 'pending' | 'accepted' | 'declined'
          type?: 'direct' | 'intro' | 'referral'
          intro_message?: string | null
          created_at?: string
          updated_at?: string
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
      coffee_chats: {
        Row: {
          id: string
          user1_id: string
          user2_id: string
          scheduled_time: string
          status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
          topic: string | null
          location: string | null
          agenda_bullets: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user1_id: string
          user2_id: string
          scheduled_time: string
          status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
          topic?: string | null
          location?: string | null
          agenda_bullets?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user1_id?: string
          user2_id?: string
          scheduled_time?: string
          status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
          topic?: string | null
          location?: string | null
          agenda_bullets?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      masterminds: {
        Row: {
          id: string
          title: string
          creator_id: string
          members: string[]
          goal: string
          cadence: 'weekly' | 'biweekly' | 'monthly'
          max_members: number
          tags: string[]
          resource_links: string[]
          next_session: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          creator_id: string
          members?: string[]
          goal: string
          cadence: 'weekly' | 'biweekly' | 'monthly'
          max_members?: number
          tags?: string[]
          resource_links?: string[]
          next_session?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          creator_id?: string
          members?: string[]
          goal?: string
          cadence?: 'weekly' | 'biweekly' | 'monthly'
          max_members?: number
          tags?: string[]
          resource_links?: string[]
          next_session?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      opportunities: {
        Row: {
          id: string
          user_id: string
          type: 'buy' | 'sell' | 'invest' | 'co_founder'
          sector: string
          is_anonymous: boolean
          description: string
          title: string | null
          created_at: string
          updated_at: string
          status: 'active' | 'closed'
        }
        Insert: {
          id?: string
          user_id: string
          type: 'buy' | 'sell' | 'invest' | 'co_founder'
          sector: string
          is_anonymous?: boolean
          description: string
          title?: string | null
          created_at?: string
          updated_at?: string
          status?: 'active' | 'closed'
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'buy' | 'sell' | 'invest' | 'co_founder'
          sector?: string
          is_anonymous?: boolean
          description?: string
          title?: string | null
          created_at?: string
          updated_at?: string
          status?: 'active' | 'closed'
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
    }
  }
}

// Helper function to check connection
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('users').select('count').limit(1)
    return !error
  } catch (error) {
    console.error('Supabase connection error:', error)
    return false
  }
}

// Helper function to get current user
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting user:', error)
    return null
  }
  return user
}
