'use client'
import { useState } from 'react'

interface FeedItem {
  id: string
  type: 'coffee_chat' | 'mastermind' | 'event' | 'introduction'
  title: string
  description: string
  time?: string
  location?: string
  participants?: string[]
  action: string
  urgent?: boolean
}

const mockFeedData: FeedItem[] = [
  {
    id: '1',
    type: 'coffee_chat',
    title: 'Coffee Chat with Aisha',
    description: 'Wellness entrepreneur, mutual interest in mindful productivity',
    time: 'Today at 4:00 PM',
    location: 'Blue Bottle Coffee, SOMA',
    action: 'View Details',
    urgent: true
  },
  {
    id: '2',
    type: 'mastermind',
    title: 'AfroTech Founders in Asia',
    description: 'New mastermind group forming for Black tech entrepreneurs in Southeast Asia',
    participants: ['Marcus Chen', 'Kemi Okafor', '+3 others'],
    action: 'Request Access'
  },
  {
    id: '3',
    type: 'event',
    title: 'Future of Work Forum',
    description: 'Remote work and digital nomad trends discussion',
    time: 'Dec 15, 2024',
    location: 'Bali, Indonesia',
    action: 'RSVP'
  },
  {
    id: '4',
    type: 'introduction',
    title: 'Smart Introduction Available',
    description: 'Sarah Kim (Product @ Stripe) wants to connect about fintech in emerging markets',
    action: 'Accept Intro'
  }
]

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'coffee_chat':
      return '☕'
    case 'mastermind':
      return '🧬'
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
    case 'mastermind':
      return 'text-purple-400'
    case 'event':
      return 'text-blue-400'
    case 'introduction':
      return 'text-green-400'
    default:
      return 'text-gray-400'
  }
}

export default function HiveFeed() {
  const [feedItems] = useState<FeedItem[]>(mockFeedData)

  return (
    <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-purple-400 flex items-center space-x-2">
          <span>🛰️</span>
          <span>Your Hive Activity</span>
        </h2>
        <button className="text-sm text-gray-400 hover:text-white transition">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {feedItems.map((item) => (
          <div 
            key={item.id}
            className={`p-4 rounded-lg border transition-all duration-200 hover:border-purple-500/50 ${
              item.urgent 
                ? 'bg-yellow-500/10 border-yellow-500/30' 
                : 'bg-zinc-800/50 border-zinc-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-lg">{getTypeIcon(item.type)}</span>
                  <h3 className="font-medium text-white">{item.title}</h3>
                  {item.urgent && (
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                      Urgent
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-300 mb-3">{item.description}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                  {item.time && (
                    <div className="flex items-center space-x-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className={item.urgent ? 'text-yellow-400' : ''}>{item.time}</span>
                    </div>
                  )}
                  
                  {item.location && (
                    <div className="flex items-center space-x-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{item.location}</span>
                    </div>
                  )}
                  
                  {item.participants && (
                    <div className="flex items-center space-x-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                      <span>{item.participants.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <button className={`ml-4 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                item.urgent
                  ? 'bg-yellow-500 text-black hover:bg-yellow-600'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              } shadow-lg hover:shadow-xl`}>
                {item.action}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-zinc-700">
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center space-x-2 p-3 bg-purple-600/20 border border-purple-500/30 rounded-lg hover:bg-purple-600/30 transition text-sm">
            <span>📅</span>
            <span>Schedule Coffee Chat</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/30 transition text-sm">
            <span>🎯</span>
            <span>Find Events</span>
          </button>
        </div>
      </div>
    </div>
  )
}
