'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useApp } from '@/components/providers/AppProvider'
import { dedupeBy, getUniqueConnections, getOtherFounderId } from '@/utils/dataUtils'

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
  const supabase = createClientComponentClient()

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

  if (isLoading) {
    return (
      <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <span>🔔</span>
          <span>Network Activity</span>
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={`loading-${i}`} className="animate-pulse">
              <div className="h-16 bg-zinc-800 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-white mb-4">Network Activity</h2>
        <div className="text-center py-4">
          <p className="text-red-400 mb-2">Failed to load activity</p>
          <button
            onClick={loadHiveActivity}
            className="text-purple-400 hover:text-purple-300 text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
          <span>🔔</span>
          <span>Network Activity</span>
        </h2>
        <button
          onClick={loadHiveActivity}
          className="text-gray-400 hover:text-white p-1 rounded"
          title="Refresh"
        >
          🔄
        </button>
      </div>

      {feedItems.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🌱</div>
          <p className="text-gray-400">No recent activity</p>
          <p className="text-sm text-gray-500 mt-1">
            Start connecting with founders to see activity here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {feedItems.map(item => (
            <div
              key={item.id}
              className="bg-zinc-800/50 border border-zinc-700 p-4 rounded-lg hover:border-zinc-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <span className={`text-lg ${getTypeColor(item.type)}`}>
                    {getTypeIcon(item.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium text-sm truncate">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                      {item.description}
                    </p>
                    {item.time && (
                      <p className="text-gray-500 text-xs mt-1">{item.time}</p>
                    )}
                  </div>
                </div>
                {item.urgent && (
                  <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full">
                    New
                  </span>
                )}
              </div>
              
              {item.action && (
                <div className="mt-3 flex justify-end">
                  <button className="text-purple-400 hover:text-purple-300 text-xs font-medium">
                    {item.action} →
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
