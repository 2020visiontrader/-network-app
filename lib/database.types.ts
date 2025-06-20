export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      availability_status: {
        Row: {
          created_at: string | null
          custom_message: string | null
          expires_at: string | null
          founder_id: string | null
          id: string
          status: Database["public"]["Enums"]["availability_type"] | null
          status_emoji: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_message?: string | null
          expires_at?: string | null
          founder_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["availability_type"] | null
          status_emoji?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_message?: string | null
          expires_at?: string | null
          founder_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["availability_type"] | null
          status_emoji?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_status_founder_id_fkey"
            columns: ["founder_id"]
            isOneToOne: true
            referencedRelation: "founders"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          coffee_chat_id: string | null
          id: string
          is_read: boolean | null
          message: string
          sender_id: string | null
          sent_at: string | null
        }
        Insert: {
          coffee_chat_id?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          sender_id?: string | null
          sent_at?: string | null
        }
        Update: {
          coffee_chat_id?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          sender_id?: string | null
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_coffee_chat_id_fkey"
            columns: ["coffee_chat_id"]
            isOneToOne: false
            referencedRelation: "coffee_chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "founders"
            referencedColumns: ["id"]
          },
        ]
      }
      coffee_chats: {
        Row: {
          confirmed_time: string | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          location_or_link: string | null
          meeting_type: string | null
          proposed_time: string | null
          requested_id: string | null
          requester_id: string | null
          requester_message: string | null
          status: Database["public"]["Enums"]["coffee_status"] | null
          updated_at: string | null
        }
        Insert: {
          confirmed_time?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          location_or_link?: string | null
          meeting_type?: string | null
          proposed_time?: string | null
          requested_id?: string | null
          requester_id?: string | null
          requester_message?: string | null
          status?: Database["public"]["Enums"]["coffee_status"] | null
          updated_at?: string | null
        }
        Update: {
          confirmed_time?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          location_or_link?: string | null
          meeting_type?: string | null
          proposed_time?: string | null
          requested_id?: string | null
          requester_id?: string | null
          requester_message?: string | null
          status?: Database["public"]["Enums"]["coffee_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coffee_chats_requested_id_fkey"
            columns: ["requested_id"]
            isOneToOne: false
            referencedRelation: "founders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coffee_chats_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "founders"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          connected_at: string | null
          connection_source: string | null
          founder_a_id: string | null
          founder_b_id: string | null
          id: string
          status: string | null
        }
        Insert: {
          connected_at?: string | null
          connection_source?: string | null
          founder_a_id?: string | null
          founder_b_id?: string | null
          id?: string
          status?: string | null
        }
        Update: {
          connected_at?: string | null
          connection_source?: string | null
          founder_a_id?: string | null
          founder_b_id?: string | null
          id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "connections_founder_a_id_fkey"
            columns: ["founder_a_id"]
            isOneToOne: false
            referencedRelation: "founders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_founder_b_id_fkey"
            columns: ["founder_b_id"]
            isOneToOne: false
            referencedRelation: "founders"
            referencedColumns: ["id"]
          },
        ]
      }
      device_tokens: {
        Row: {
          created_at: string | null
          device_token: string
          founder_id: string | null
          id: string
          is_active: boolean | null
          platform: string
        }
        Insert: {
          created_at?: string | null
          device_token: string
          founder_id?: string | null
          id?: string
          is_active?: boolean | null
          platform: string
        }
        Update: {
          created_at?: string | null
          device_token?: string
          founder_id?: string | null
          id?: string
          is_active?: boolean | null
          platform?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_tokens_founder_id_fkey"
            columns: ["founder_id"]
            isOneToOne: false
            referencedRelation: "founders"
            referencedColumns: ["id"]
          },
        ]
      }
      event_attendees: {
        Row: {
          event_id: string | null
          founder_id: string | null
          id: string
          registered_at: string | null
          status: Database["public"]["Enums"]["attendance_status"] | null
        }
        Insert: {
          event_id?: string | null
          founder_id?: string | null
          id?: string
          registered_at?: string | null
          status?: Database["public"]["Enums"]["attendance_status"] | null
        }
        Update: {
          event_id?: string | null
          founder_id?: string | null
          id?: string
          registered_at?: string | null
          status?: Database["public"]["Enums"]["attendance_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendees_founder_id_fkey"
            columns: ["founder_id"]
            isOneToOne: false
            referencedRelation: "founders"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          description: string | null
          end_time: string | null
          event_type: string | null
          id: string
          is_free: boolean | null
          location: string | null
          max_attendees: number | null
          organizer_id: string | null
          start_time: string
          title: string
          virtual_link: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          event_type?: string | null
          id?: string
          is_free?: boolean | null
          location?: string | null
          max_attendees?: number | null
          organizer_id?: string | null
          start_time: string
          title: string
          virtual_link?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          event_type?: string | null
          id?: string
          is_free?: boolean | null
          location?: string | null
          max_attendees?: number | null
          organizer_id?: string | null
          start_time?: string
          title?: string
          virtual_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "founders"
            referencedColumns: ["id"]
          },
        ]
      }
      founder_applications: {
        Row: {
          admin_notes: string | null
          application_status:
            | Database["public"]["Enums"]["application_status"]
            | null
          applied_at: string | null
          brief_description: string
          city: string | null
          company_name: string
          company_website: string | null
          email: string
          full_name: string
          funding_stage: string | null
          id: string
          linkedin_url: string
          niche: string | null
          referral_code: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          timestamp: string | null
          why_join: string | null
        }
        Insert: {
          admin_notes?: string | null
          application_status?:
            | Database["public"]["Enums"]["application_status"]
            | null
          applied_at?: string | null
          brief_description: string
          city?: string | null
          company_name: string
          company_website?: string | null
          email: string
          full_name: string
          funding_stage?: string | null
          id?: string
          linkedin_url: string
          niche?: string | null
          referral_code?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          timestamp?: string | null
          why_join?: string | null
        }
        Update: {
          admin_notes?: string | null
          application_status?:
            | Database["public"]["Enums"]["application_status"]
            | null
          applied_at?: string | null
          brief_description?: string
          city?: string | null
          company_name?: string
          company_website?: string | null
          email?: string
          full_name?: string
          funding_stage?: string | null
          id?: string
          linkedin_url?: string
          niche?: string | null
          referral_code?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          timestamp?: string | null
          why_join?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "founder_applications_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "founders"
            referencedColumns: ["id"]
          },
        ]
      }
      founders: {
        Row: {
          bio: string | null
          company_name: string
          company_stage: string | null
          company_website: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          industry: string | null
          is_active: boolean | null
          is_verified: boolean | null
          last_active: string | null
          linkedin_url: string | null
          location_city: string | null
          location_country: string | null
          member_number: number | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          profile_photo_url: string | null
          role: string
          tagline: string | null
          twitter_handle: string | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          company_name: string
          company_stage?: string | null
          company_website?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          industry?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          last_active?: string | null
          linkedin_url?: string | null
          location_city?: string | null
          location_country?: string | null
          member_number?: number | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          profile_photo_url?: string | null
          role: string
          tagline?: string | null
          twitter_handle?: string | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          company_name?: string
          company_stage?: string | null
          company_website?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          industry?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          last_active?: string | null
          linkedin_url?: string | null
          location_city?: string | null
          location_country?: string | null
          member_number?: number | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          profile_photo_url?: string | null
          role?: string
          tagline?: string | null
          twitter_handle?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      location_shares: {
        Row: {
          available_for_meetups: boolean | null
          city: string
          country: string
          founder_id: string | null
          id: string
          is_traveling: boolean | null
          updated_at: string | null
        }
        Insert: {
          available_for_meetups?: boolean | null
          city: string
          country: string
          founder_id?: string | null
          id?: string
          is_traveling?: boolean | null
          updated_at?: string | null
        }
        Update: {
          available_for_meetups?: boolean | null
          city?: string
          country?: string
          founder_id?: string | null
          id?: string
          is_traveling?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "location_shares_founder_id_fkey"
            columns: ["founder_id"]
            isOneToOne: true
            referencedRelation: "founders"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string | null
          data: Json | null
          founder_id: string | null
          id: string
          is_pushed: boolean | null
          is_read: boolean | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          body: string
          created_at?: string | null
          data?: Json | null
          founder_id?: string | null
          id?: string
          is_pushed?: boolean | null
          is_read?: boolean | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          body?: string
          created_at?: string | null
          data?: Json | null
          founder_id?: string | null
          id?: string
          is_pushed?: boolean | null
          is_read?: boolean | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "notifications_founder_id_fkey"
            columns: ["founder_id"]
            isOneToOne: false
            referencedRelation: "founders"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string | null
          email_referred: string | null
          id: string
          referral_code: string
          referrer_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          email_referred?: string | null
          id?: string
          referral_code: string
          referrer_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          email_referred?: string | null
          id?: string
          referral_code?: string
          referrer_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "founders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      promote_founder_application: {
        Args: { application_email: string }
        Returns: boolean
      }
    }
    Enums: {
      application_status: "pending" | "approved" | "rejected"
      attendance_status: "attending" | "maybe" | "cancelled"
      availability_type:
        | "available"
        | "busy"
        | "coffee_break"
        | "building"
        | "offline"
      coffee_status: "pending" | "confirmed" | "completed" | "cancelled"
      notification_type:
        | "coffee_request"
        | "chat_confirmed"
        | "new_connection"
        | "system"
        | "welcome"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      application_status: ["pending", "approved", "rejected"],
      attendance_status: ["attending", "maybe", "cancelled"],
      availability_type: [
        "available",
        "busy",
        "coffee_break",
        "building",
        "offline",
      ],
      coffee_status: ["pending", "confirmed", "completed", "cancelled"],
      notification_type: [
        "coffee_request",
        "chat_confirmed",
        "new_connection",
        "system",
        "welcome",
      ],
    },
  },
} as const
