// Mobile Founder Platform Types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Founder-specific types for mobile platform
export interface Founder {
  id: string
  email: string
  full_name: string
  company_name: string
  role: string
  company_stage?: string
  industry?: string
  tagline?: string
  bio?: string
  profile_photo_url?: string
  location_city?: string
  location_country?: string
  linkedin_url?: string
  twitter_handle?: string
  company_website?: string
  is_verified: boolean
  is_active: boolean
  member_number: number
  onboarding_completed: boolean
  onboarding_step: number
  created_at: string
  last_active: string
  updated_at: string
}

export interface FounderApplication {
  id: string
  email: string
  full_name: string
  company_name: string
  company_website?: string
  linkedin_url: string
  funding_stage?: string
  brief_description: string
  referral_code?: string
  application_status: 'pending' | 'approved' | 'rejected'
  admin_notes?: string
  applied_at: string
  reviewed_at?: string
  reviewer_id?: string
}

export interface CoffeeChat {
  id: string
  requester_id: string
  requested_id: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  proposed_time?: string
  confirmed_time?: string
  meeting_type: 'virtual' | 'in-person'
  location_or_link?: string
  requester_message?: string
  duration_minutes: number
  created_at: string
  updated_at: string
}

export interface FounderConnection {
  id: string
  founder_a_id: string
  founder_b_id: string
  status: 'connected' | 'blocked'
  connected_at: string
  connection_source: 'app' | 'event' | 'referral'
}

export interface MobileNotification {
  id: string
  founder_id: string
  type: 'coffee_request' | 'chat_confirmed' | 'new_connection' | 'system' | 'welcome'
  title: string
  body: string
  data: Json
  is_read: boolean
  is_pushed: boolean
  created_at: string
}

export interface FounderEvent {
  id: string
  title: string
  description?: string
  organizer_id: string
  event_type: 'networking' | 'demo_day' | 'workshop'
  start_time: string
  end_time?: string
  location?: string
  virtual_link?: string
  max_attendees: number
  is_free: boolean
  created_at: string
}

// Database schema for mobile founder platform
export interface Database {
  public: {
    Tables: {
      founders: {
        Row: Founder
        Insert: Omit<Founder, 'id' | 'created_at' | 'updated_at' | 'member_number'>
        Update: Partial<Omit<Founder, 'id' | 'created_at' | 'member_number'>>
      }
      founder_applications: {
        Row: FounderApplication
        Insert: Omit<FounderApplication, 'id' | 'applied_at'>
        Update: Partial<Omit<FounderApplication, 'id' | 'applied_at'>>
      }
      coffee_chats: {
        Row: CoffeeChat
        Insert: Omit<CoffeeChat, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<CoffeeChat, 'id' | 'created_at'>>
      }
      connections: {
        Row: FounderConnection
        Insert: Omit<FounderConnection, 'id' | 'connected_at'>
        Update: Partial<Omit<FounderConnection, 'id' | 'connected_at'>>
      }
      notifications: {
        Row: MobileNotification
        Insert: Omit<MobileNotification, 'id' | 'created_at'>
        Update: Partial<Omit<MobileNotification, 'id' | 'created_at'>>
      }
      events: {
        Row: FounderEvent
        Insert: Omit<FounderEvent, 'id' | 'created_at'>
        Update: Partial<Omit<FounderEvent, 'id' | 'created_at'>>
      }
    }
  }
}
