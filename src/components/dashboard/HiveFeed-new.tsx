'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useApp } from '@/components/providers/AppProvider'
import type { Database } from '@/lib/database.types'

// Using the founders table from the mobile founder schema
type Founder = Database['public']['Tables']['founders']['Row']
type CoffeeChat = Database['public']['Tables']['coffee_chats']['Row']
type Event = Database['public']['Tables']['events']['Row']

interface FeedItem {
  id: string
  type: 'coffee_chat' | 'event' | 'connection'
  title: string
  description: string
  time?: string
  location?: string
  action: string
  urgent: boolean
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'coffee_chat':
      return '☕'
    case 'event':
      return '🎤'
    case 'connection':
      return '🤝'
    default:
      return '📡'
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'coffee_chat':
      return 'text-yellow-400'
    case 'event':
      return 'text-blue-400'
    case 'connection':
      return 'text-green-400'
    default:
      return 'text-gray-400'
  }
}

export default function HiveFeed() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useApp()
  const router = useRouter()

  useEffect(() => {
    if (!user) return

    const loadHiveActivity = async () => {
      try {
        setIsLoading(true)
        setError('')

        const supabase = createBrowserClient<Database>(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const [coffeeChatsResult, eventsResult, connectionsResult] = await Promise.all([
          // Get user's recent coffee chats
          supabase
            .from('coffee_chats')
            .select(`
              id,
              status,
              proposed_time,
              meeting_type,
              requester:founders!requester_id(full_name, company_name),
              requested:founders!requested_id(full_name, company_name)
            `)
            .or(`requester_id.eq.${user.id},requested_id.eq.${user.id}`)
            .order('created_at', { ascending: false })
            .limit(3),
            
          // Get upcoming events
          supabase
            .from('events')
            .select(`
              id, 
              title,
              description,
              start_time,
              location,
              organizer:founders!organizer_id(full_name)
            `)
            .gte('start_time', new Date().toISOString())
            .order('start_time', { ascending: true })
            .limit(3),

          // Get user's recent connections
          supabase
            .from('connections')
            .select(`
              id,
              connected_at,
              founder_a:founders!founder_a_id(full_name, company_name, location_city),
              founder_b:founders!founder_b_id(full_name, company_name, location_city)
            `)
            .or(`founder_a_id.eq.${user.id},founder_b_id.eq.${user.id}`)
            .eq('status', 'connected' as any)
            .order('connected_at', { ascending: false })
            .limit(3)
        ])

        // Transform into feed items
        const items: FeedItem[] = []

        // Add coffee chats
        if (!coffeeChatsResult.error && coffeeChatsResult.data) {
          coffeeChatsResult.data.forEach((chat: any) => {
            const otherFounder = chat.requester_id === user.id ? chat.requested : chat.requester
            items.push({
              id: chat.id,
              type: 'coffee_chat',
              title: `Coffee Chat with ${otherFounder?.full_name || 'Unknown'}`,
              description: `${chat.status} - ${otherFounder?.company_name || 'Unknown Company'}`,
              time: chat.proposed_time ? new Date(chat.proposed_time).toLocaleDateString() : undefined,
              action: chat.status === 'pending' ? 'Review Request' : 'View Details',
              urgent: chat.status === 'pending'
            })
          })
        }

        // Add events
        if (!eventsResult.error && eventsResult.data) {
          eventsResult.data.forEach((event: any) => {
            items.push({
              id: event.id,
              type: 'event',
              title: event.title,
              description: event.description || `Hosted by ${event.organizer?.full_name || 'Unknown'}`,
              time: new Date(event.start_time).toLocaleDateString(),
              location: event.location || 'Virtual',
              action: 'View Event',
              urgent: new Date(event.start_time).toDateString() === new Date().toDateString()
            })
          })
        }

        // Add connections
        if (!connectionsResult.error && connectionsResult.data) {
          connectionsResult.data.forEach((connection: any) => {
            const otherFounder = connection.founder_a_id === user.id ? connection.founder_b : connection.founder_a
            items.push({
              id: connection.id,
              type: 'connection',
              title: `Connected with ${otherFounder?.full_name || 'Unknown'}`,
              description: `${otherFounder?.company_name || 'Unknown Company'} • ${otherFounder?.location_city || 'Unknown Location'}`,
              time: new Date(connection.connected_at).toLocaleDateString(),
              action: 'View Profile',
              urgent: false
            })
          })
        }

        // Sort by urgency and recency
        items.sort((a: FeedItem, b: FeedItem) => {
          if (a.urgent && !b.urgent) return -1
          if (!a.urgent && b.urgent) return 1
          return 0
        })

        setFeedItems(items.slice(0, 6)) // Show max 6 items
        setError('')
      } catch (err) {
        console.error('Error loading feed:', err)
        setError('Failed to load feed items')
      } finally {
        setIsLoading(false)
      }
    }

    loadHiveActivity()
  }, [user])

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-200 rounded-lg p-4 h-20"></div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
        {error}
      </div>
    )
  }

  if (feedItems.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">📡</div>
        <p>No recent activity</p>
        <p className="text-sm">Start connecting with other founders!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {feedItems.map(item => (
        <div
          key={item.id}
          className="bg-white border border-gray-200 p-4 rounded-lg hover:shadow-md transition-all cursor-pointer"
          onClick={() => router.push(`/${item.type === 'connection' ? 'contacts' : item.type}/${item.id}`)}
        >
          <div className="flex items-start space-x-4">
            <div className={`${getTypeColor(item.type)} text-2xl`}>
              {getTypeIcon(item.type)}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
              <p className="text-gray-600 mt-1">{item.description}</p>
              {(item.time || item.location) && (
                <div className="mt-2 text-sm text-gray-500">
                  {item.time && <span className="mr-3">🕒 {item.time}</span>}
                  {item.location && <span>📍 {item.location}</span>}
                </div>
              )}
              <div className="mt-3">
                <button className={`text-sm font-medium px-3 py-1 rounded-full ${
                  item.urgent 
                    ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  {item.action}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
