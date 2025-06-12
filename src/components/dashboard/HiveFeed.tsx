'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useApp } from '@/components/providers/AppProvider'
import type { Database } from '@/lib/database.types'

type User = Database['public']['Tables']['users']['Row']
type CoffeeChat = Database['public']['Tables']['coffee_chats']['Row']

interface DatabaseEvent {
  id: string
  title: string
  description: string | null
  date: string
  location: string | null
  creator_id: string
  users: {
    full_name: string
  }
}

interface DatabaseConnection {
  id: string
  user: {
    full_name: string
    city: string | null
  }
}

interface FeedItem {
  id: string
  type: 'coffee_chat' | 'event' | 'introduction'
  title: string
  description: string
  time?: string
  location?: string
  participants?: string[]
  action: string
  urgent: boolean
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'coffee_chat':
      return '☕'
    case 'event':
      return '🎤'
    case 'introduction':
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
    case 'introduction':
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
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    if (!user) return

    loadHiveActivity()

    // Set up real-time subscriptions for updates
    const channel = supabase.channel('public:updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'coffee_chats',
      }, () => {
        loadHiveActivity()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const loadHiveActivity = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      setError('')

      const [coffeeChatsResult, eventsResult, connectionsResult] = await Promise.all([
        // Get user's coffee chats
        supabase
          .from('coffee_chats')
          .select(`
            id,
            city,
            date_available,
            public_visibility,
            user:users(full_name)
          `)
          .eq('user_id', user.id)
          .limit(3)
          .single(),
          
        // Get upcoming events
        supabase
          .from('events')
          .select(`
            id, 
            title,
            description,
            date,
            location,
            creator_id,
            users!creator_id(full_name)
          `)
          .gt('date', new Date().toISOString().split('T')[0])
          .limit(2),

        // Get user's connections
        supabase
          .from('users')
          .select(`
            id,
            full_name,
            city,
            created_at
          `)
          .neq('id', user.id)
          .limit(3)
      ])

      // Transform into feed items
      const items: FeedItem[] = []

      // Add coffee chat status
      if (!coffeeChatsResult.error && coffeeChatsResult.data) {
        const chat = coffeeChatsResult.data
        items.push({
          id: chat.id,
          type: 'coffee_chat',
          title: 'Coffee Chat Status',
          description: `Available in ${chat.city} on ${new Date(chat.date_available).toLocaleDateString()}`,
          location: chat.city,
          action: 'Update Status',
          urgent: false
        })
      }

      // Add events
      if (!eventsResult.error && eventsResult.data) {
        eventsResult.data.forEach((event) => {
          items.push({
            id: event.id,
            type: 'event',
            title: event.title,
            description: event.description || 'No description available',
            time: event.date,
            location: event.location || undefined,
            action: 'View Details',
            urgent: new Date(event.date).toDateString() === new Date().toDateString()
          })
        })
      }

      // Add connections
      if (!connectionsResult.error && connectionsResult.data) {
        connectionsResult.data.forEach((connection) => {
          items.push({
            id: connection.id,
            type: 'introduction',
            title: `Connect with ${connection.full_name}`,
            description: `Based in ${connection.city || 'Unknown Location'}`,
            action: 'View Profile',
            urgent: false
          })
        })
      }

      setFeedItems(items)
      setError('')
    } catch (err) {
      console.error('Error loading feed:', err)
      setError('Failed to load feed items')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="space-y-4">
      {feedItems.map(item => (
        <div
          key={item.id}
          className="bg-zinc-900/70 border border-zinc-800 p-4 rounded-xl backdrop-blur-sm hover:bg-zinc-900/90 transition-all cursor-pointer"
          onClick={() => router.push(`/${item.type}/${item.id}`)}
        >
          <div className="flex items-start space-x-4">
            <div className={`${getTypeColor(item.type)} text-2xl`}>
              {getTypeIcon(item.type)}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-white">{item.title}</h3>
              <p className="text-gray-400 mt-1">{item.description}</p>
              {(item.time || item.location) && (
                <div className="mt-2 text-sm text-gray-500">
                  {item.time && <span className="mr-3">🕒 {item.time}</span>}
                  {item.location && <span>📍 {item.location}</span>}
                </div>
              )}
              {item.participants && (
                <div className="mt-2 text-sm text-gray-500">
                  👥 {item.participants.join(', ')}
                </div>
              )}
              <div className="mt-3">
                <button className={`text-sm font-medium px-3 py-1 rounded-full ${item.urgent ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
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
