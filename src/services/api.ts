import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

// Type aliases for easier use
type Tables = Database['public']['Tables']
type UserRow = Tables['users']['Row']
type UserInsert = Tables['users']['Insert']
type UserUpdate = Tables['users']['Update']
type AnnouncementInsert = Tables['announcements']['Insert']
type UsageMetricInsert = Tables['usage_metrics']['Insert']

// User Management
export async function createUser(userData: UserInsert): Promise<UserRow | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .maybeSingle()

    if (error) {
      console.error('Error creating user:', error)
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
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .maybeSingle()

    if (error) {
      console.error('Error updating user:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error updating user:', error)
    return null
  }
}

export async function getUserById(userId: string): Promise<UserRow | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching user:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

// Announcements
export async function postAnnouncement(announcementData: AnnouncementInsert): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('announcements')
      .insert(announcementData)

    if (error) {
      console.error('Error posting announcement:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error posting announcement:', error)
    return false
  }
}

export async function getActiveAnnouncements() {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('visibility', true)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching announcements:', error)
      return []
    }

    return data
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return []
  }
}

export async function updateAnnouncementVisibility(
  announcementId: string, 
  visibility: boolean
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('announcements')
      .update({ visibility })
      .eq('id', announcementId)

    if (error) {
      console.error('Error updating announcement visibility:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating announcement visibility:', error)
    return false
  }
}

// Analytics & Usage Tracking
export async function logUserAction(
  userId: string,
  eventType: 'coffee_chat' | 'event_rsvp' | 'mastermind_created' | 'intro_made' | 'event_hosted',
  metadata?: Record<string, any>
): Promise<boolean> {
  try {
    const usageData: UsageMetricInsert = {
      user_id: userId,
      event_type: eventType,
      timestamp: new Date().toISOString(),
      metadata: metadata || null
    }

    const { error } = await supabase
      .from('usage_metrics')
      .insert(usageData)

    if (error) {
      console.error('Error logging user action:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error logging user action:', error)
    return false
  }
}

export async function getUserAnalytics(userId: string) {
  try {
    const { data, error } = await supabase
      .from('usage_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })

    if (error) {
      console.error('Error fetching user analytics:', error)
      return []
    }

    return data
  } catch (error) {
    console.error('Error fetching user analytics:', error)
    return []
  }
}

export async function getWeeklyAnalytics(startDate?: string) {
  try {
    const weekStart = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    
    const { data, error } = await supabase
      .from('usage_metrics')
      .select('*')
      .gte('timestamp', weekStart)
      .order('timestamp', { ascending: false })

    if (error) {
      console.error('Error fetching weekly analytics:', error)
      return []
    }

    return data
  } catch (error) {
    console.error('Error fetching weekly analytics:', error)
    return []
  }
}

// Referral System
export async function triggerReferralInvite(
  referrerUserId: string,
  inviteeEmail: string,
  customMessage?: string
): Promise<boolean> {
  try {
    // First, get the referrer's referral code
    const { data: referrer, error: referrerError } = await supabase
      .from('users')
      .select('referral_code, name')
      .eq('id', referrerUserId)
      .maybeSingle()

    if (referrerError || !referrer) {
      console.error('Error fetching referrer:', referrerError)
      return false
    }

    // Create user invitation instead of waitlist
    const invitationData = {
      email: inviteeEmail,
      referrer_id: referrerUserId,
      status: 'pending',
      created_at: new Date().toISOString()
    }

    try {
      const { error } = await supabase
        .from('invitations')
        .insert(invitationData)

      if (error) {
        console.error('Error creating invitation:', error)
        return false
      }
      
      // Log the referral action
      await logUserAction(referrerUserId, 'intro_made', {
        invitee_email: inviteeEmail,
        custom_message: customMessage
      })
      
      return true
    } catch (error) {
      console.error('Error creating invitation:', error)
      return false
    }
  } catch (error) {
    console.error('Error triggering referral invite:', error)
    return false
  }
}

// Coffee Chat Management
export async function scheduleCoffeeChat(
  user1Id: string,
  user2Id: string,
  scheduledTime: string,
  location?: string,
  agendaBullets?: string[]
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('coffee_chats')
      .insert({
        user1_id: user1Id,
        user2_id: user2Id,
        scheduled_time: scheduledTime,
        location,
        agenda_bullets: agendaBullets,
        status: 'scheduled'
      })

    if (error) {
      console.error('Error scheduling coffee chat:', error)
      return false
    }

    // Log the action for both users
    await logUserAction(user1Id, 'coffee_chat', {
      other_user_id: user2Id,
      location,
      scheduled_time: scheduledTime
    })

    return true
  } catch (error) {
    console.error('Error scheduling coffee chat:', error)
    return false
  }
}

// Event Management
export async function createEvent(eventData: Tables['events']['Insert']): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('events')
      .insert(eventData)

    if (error) {
      console.error('Error creating event:', error)
      return false
    }

    // Log the action
    await logUserAction(eventData.creator_id, 'event_hosted', {
      event_type: eventData.type,
      title: eventData.title
    })

    return true
  } catch (error) {
    console.error('Error creating event:', error)
    return false
  }
}

// Connection Management
export async function createConnection(
  initiatorId: string,
  receiverId: string,
  type: 'direct' | 'intro' | 'referral',
  introMessage?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('connections')
      .insert({
        initiator_id: initiatorId,
        receiver_id: receiverId,
        type,
        intro_message: introMessage,
        status: 'pending'
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
