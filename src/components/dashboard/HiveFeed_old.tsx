'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useApp } from '@/components/providers/AppProvider'
import { dedupeBy, getUniqueConnections, getOtherFounderId } from '@/utils/dataUtils'

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
      
      // Clear existing feed items
      setFeedItems([])

      // Get user's actual connections (not all users)
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('connections')
        .select('founder_a_id, founder_b_id, status, created_at')
        .or(`founder_a_id.eq.${user.id},founder_b_id.eq.${user.id}`)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false })
        .limit(10)

      if (connectionsError) {
        console.warn('Connections error:', connectionsError)
      }

      // Get unique connections and connected founder IDs
      const uniqueConnections = getUniqueConnections(connectionsData || [], user.id)
      const connectedFounderIds = uniqueConnections.map(conn => 
        getOtherFounderId(conn, user.id)
      )

      // Get coffee chats for connected users only
      let coffeeChatsData = []
      if (connectedFounderIds.length > 0) {
        const { data, error } = await supabase
          .from('coffee_chats')
          .select('id, requester_id, requested_id, created_at, status')
          .or(`requester_id.eq.${user.id},requested_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
          .limit(5)

        if (!error && data) {
          coffeeChatsData = data
        }
      }

      // Transform into feed items with deduplication
      const items: FeedItem[] = []

      // Add connection activities (deduplicated)
      const recentConnections = uniqueConnections.slice(0, 3)
      recentConnections.forEach((conn, index) => {
        items.push({
          id: `connection-${conn.founder_a_id}-${conn.founder_b_id}`,
          type: 'introduction',
          title: 'New Connection Made',
          description: 'Connected with a fellow founder',
          action: 'View Profile',
          urgent: false
        })
      })

      // Add coffee chat activities (deduplicated)
      const uniqueCoffeeChats = dedupeBy(coffeeChatsData, 'id')
      uniqueCoffeeChats.slice(0, 2).forEach((chat, index) => {
        items.push({
          id: `coffee-${chat.id}`,
          type: 'coffee_chat',
          title: 'Coffee Chat Scheduled',
          description: 'Networking meeting arranged',
          action: 'View Details',
          urgent: chat.status === 'pending'
        })
      })

      // Sort by urgency and recency, then deduplicate again by ID
      const sortedItems = items
        .sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0))
      
      const uniqueItems = dedupeBy(sortedItems, 'id')
      
      setFeedItems(uniqueItems.slice(0, 5)) // Limit to 5 most recent items

    } catch (error) {
      console.error('Error loading hive activity:', error)
      setError('Failed to load activity feed')
      setFeedItems([]) // Clear on error
    } finally {
      setIsLoading(false)
    }
  }

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
