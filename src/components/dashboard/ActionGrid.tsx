'use client'
import { useRouter } from 'next/navigation'

interface ActionCard {
  id: string
  title: string
  description: string
  icon: string
  color: string
  action: string
  route: string
  badge?: string
}

const actionCards: ActionCard[] = [
  {
    id: 'host-mastermind',
    title: 'Host Mastermind',
    description: 'Create a focused group for your industry or interest',
    icon: '🧬',
    color: 'from-purple-600 to-purple-800',
    action: 'Create Group',
    route: '/masterminds',
    badge: 'Popular'
  },
  {
    id: 'find-events',
    title: 'Find Events',
    description: 'Discover networking events and conferences in your area',
    icon: '🎤',
    color: 'from-blue-600 to-blue-800',
    action: 'Browse Events',
    route: '/events'
  },
  {
    id: 'book-chat',
    title: 'Book Coffee Chat',
    description: 'Schedule 1:1 meetings with interesting connections',
    icon: '☕',
    color: 'from-yellow-600 to-yellow-800',
    action: 'Find People',
    route: '/coffee-chats'
  },
  {
    id: 'invite-others',
    title: 'Invite Others',
    description: 'Bring your network to Network and earn rewards',
    icon: '🤝',
    color: 'from-green-600 to-green-800',
    action: 'Send Invites',
    route: '/ambassador',
    badge: 'Earn $50'
  },
  {
    id: 'travel-mode',
    title: 'Travel Mode',
    description: 'Connect with locals and travelers in your destination',
    icon: '✈️',
    color: 'from-indigo-600 to-indigo-800',
    action: 'Set Location',
    route: '/travel'
  },
  {
    id: 'skill-share',
    title: 'Skill Share',
    description: 'Offer mentorship or learn from experts in your field',
    icon: '🎯',
    color: 'from-pink-600 to-pink-800',
    action: 'Get Started',
    route: '/introductions'
  }
]

export default function ActionGrid() {
  const router = useRouter()

  const handleActionClick = (route: string) => {
    router.push(route)
  }

  return (
    <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-purple-400 flex items-center space-x-2">
          <span>🛠️</span>
          <span>Quick Actions</span>
        </h2>
        <button className="text-sm text-gray-400 hover:text-white transition">
          Customize
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actionCards.map((card) => (
          <div
            key={card.id}
            className="group relative bg-zinc-800/50 border border-zinc-700 p-5 rounded-xl hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer"
            onClick={() => handleActionClick(card.route)}
          >
            {/* Badge */}
            {card.badge && (
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                {card.badge}
              </div>
            )}

            {/* Icon */}
            <div className={`w-12 h-12 bg-gradient-to-r ${card.color} rounded-lg flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow`}>
              <span className="text-2xl">{card.icon}</span>
            </div>

            {/* Content */}
            <h3 className="font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
              {card.title}
            </h3>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              {card.description}
            </p>

            {/* Action Button */}
            <button
              className={`w-full bg-gradient-to-r ${card.color} text-white font-medium py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-200 group-hover:shadow-xl`}
              onClick={(e) => {
                e.stopPropagation()
                handleActionClick(card.route)
              }}
            >
              {card.action}
            </button>

            {/* Hover Glow Effect */}
            <div className={`absolute inset-0 bg-gradient-to-r ${card.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`} />
          </div>
        ))}
      </div>

      {/* Featured Action */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/30 to-yellow-900/30 border border-purple-500/30 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-yellow-400 rounded-lg flex items-center justify-center">
              <span className="text-lg">🌟</span>
            </div>
            <div>
              <h3 className="font-semibold text-white">Weekly Challenge</h3>
              <p className="text-sm text-gray-400">Make 3 new connections this week</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-yellow-400">1/3</div>
            <div className="text-xs text-gray-500">Progress</div>
          </div>
        </div>
        <div className="mt-3 w-full bg-zinc-700 rounded-full h-2">
          <div className="bg-gradient-to-r from-purple-500 to-yellow-400 h-2 rounded-full" style={{ width: '33%' }} />
        </div>
      </div>
    </div>
  )
}
