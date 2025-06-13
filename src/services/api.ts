import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '../../lib/database.types';

const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Type aliases for easier use
type Tables = Database['public']['Tables']

// Using founders table
type UserRow = Tables['founders']['Row']
type UserInsert = Tables['founders']['Insert']
type UserUpdate = Tables['founders']['Update']

// Event types from database schema
type EventRow = Tables['events']['Row']
type EventInsert = Tables['events']['Insert']

// Coffee chat types
type CoffeeChatRow = Tables['coffee_chats']['Row']
type CoffeeChatInsert = Tables['coffee_chats']['Insert']

// Connection types
type ConnectionRow = Tables['connections']['Row']
type ConnectionInsert = Tables['connections']['Insert']

// User Management
export async function createUser(userData: UserInsert): Promise<UserRow | null> {
  try {
    const { data, error } = await supabase
      .from('founders')
      .insert(userData)
      .select()
      .single()

    if (error) {
      console.error('Error creating founder:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error creating user:', error)
    return null
  }
}

export async function updateUser(userId: string, updates: UserUpdate): Promise<UserRow | null> {
  try {
    const { data, error } = await supabase
      .from('founders')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating founder:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error updating founder:', error)
    return null
  }
}

export async function getUserById(userId: string): Promise<UserRow | null> {
  try {
    const { data, error } = await supabase
      .from('founders')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching founder:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

// Founder Application Management
export async function submitFounderApplication(applicationData: Tables['founder_applications']['Insert']): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('founder_applications')
      .insert(applicationData)

    if (error) {
      console.error('Error submitting founder application:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error submitting founder application:', error)
    return false
  }
}

export async function getFounderApplications() {
  try {
    const { data, error } = await supabase
      .from('founder_applications')
      .select('*')
      .order('applied_at', { ascending: false })

    if (error) {
      console.error('Error fetching founder applications:', error)
      return []
    }

    return data
  } catch (error) {
    console.error('Error fetching founder applications:', error)
    return []
  }
}

export async function updateFounderApplicationStatus(
  applicationId: string, 
  status: Database['public']['Enums']['application_status']
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('founder_applications')
      .update({ 
        application_status: status,
        reviewed_at: new Date().toISOString() 
      })
      .eq('id', applicationId)

    if (error) {
      console.error('Error updating application status:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating application status:', error)
    return false
  }
}

// Notifications Management
export async function createNotification(notificationData: Tables['notifications']['Insert']): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert(notificationData)

    if (error) {
      console.error('Error creating notification:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error creating notification:', error)
    return false
  }
}

export async function getNotifications(founderId: string) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('founder_id', founderId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notifications:', error)
      return []
    }

    return data
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
}

// Coffee Chat Management
export async function scheduleCoffeeChat(
  requesterId: string,
  requestedId: string,
  proposedTime: string,
  meetingType: 'virtual' | 'in-person',
  locationOrLink?: string,
  requesterMessage?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('coffee_chats')
      .insert({
        requester_id: requesterId,
        requested_id: requestedId,
        proposed_time: proposedTime,
        meeting_type: meetingType,
        location_or_link: locationOrLink,
        requester_message: requesterMessage,
        status: 'pending',
        duration_minutes: 30
      })

    if (error) {
      console.error('Error scheduling coffee chat:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error scheduling coffee chat:', error)
    return false
  }
}

// Event Management
export async function createEvent(eventData: EventInsert): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('events')
      .insert({
        ...eventData,
        event_type: eventData.event_type || 'networking',
        is_free: eventData.is_free ?? true,
        max_attendees: eventData.max_attendees ?? 20
      })

    if (error) {
      console.error('Error creating event:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error creating event:', error)
    return false
  }
}

// Connection Management
export async function createConnection(
  founderAId: string,
  founderBId: string,
  connectionSource: 'app' | 'event' | 'referral'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('connections')
      .insert({
        founder_a_id: founderAId,
        founder_b_id: founderBId,
        connection_source: connectionSource,
        status: 'connected',
        connected_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error creating connection:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error creating connection:', error)
    return false
  }
}
