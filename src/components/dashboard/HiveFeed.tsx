'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/components/providers/AppProvider'

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
      return 'text-yellow-600'
    case 'event':
      return 'text-blue-600'
    case 'connection':
      return 'text-green-600'
    default:
      return 'text-gray-600'
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

        // Create mock data for now to avoid database issues during build
        const mockItems: FeedItem[] = [
          {
            id: '1',
            type: 'coffee_chat',
            title: 'Coffee Chat with Sarah Wilson',
            description: 'pending - TechCorp Solutions',
            time: new Date().toLocaleDateString(),
            action: 'Review Request',
            urgent: true
          },
          {
            id: '2',
            type: 'event',
            title: 'Founder Meetup Downtown',
            description: 'Hosted by Network Team',
            time: new Date(Date.now() + 86400000).toLocaleDateString(),
            location: 'Downtown Conference Center',
            action: 'View Event',
            urgent: false
          },
          {
            id: '3',
            type: 'connection',
            title: 'Connected with Mike Chen',
            description: 'InnovateLab • San Francisco',
            time: new Date(Date.now() - 86400000).toLocaleDateString(),
            action: 'View Profile',
            urgent: false
          }
        ]

        setFeedItems(mockItems)
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
          className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
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
                  {item.location && <span>�� {item.location}</span>}
                </div>
              )}
              <div className="mt-3">
                <button className={`text-sm font-medium px-3 py-1 rounded-full transition-colors ${
                  item.urgent 
                    ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100' 
                    : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
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
