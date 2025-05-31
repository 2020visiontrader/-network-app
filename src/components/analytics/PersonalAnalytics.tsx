'use client'
import { useState, useEffect } from 'react'
import { analyticsService, UserAnalytics } from '@/lib/analytics'

interface PersonalAnalyticsProps {
  userId: string
}

interface Milestone {
  id: string
  title: string
  description: string
  threshold: number
  currentValue: number
  isCompleted: boolean
  icon: string
  color: string
}

export default function PersonalAnalytics({ userId }: PersonalAnalyticsProps) {
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [newMilestone, setNewMilestone] = useState<Milestone | null>(null)

  useEffect(() => {
    const analytics = analyticsService.getUserAnalytics(userId)
    if (analytics) {
      setUserAnalytics(analytics)
      checkForNewMilestones(analytics)
    }
  }, [userId])

  const checkForNewMilestones = (analytics: UserAnalytics) => {
    const milestones = getMilestones(analytics)
    const newlyCompleted = milestones.find(m => 
      m.isCompleted && 
      m.currentValue === m.threshold && 
      !localStorage.getItem(`milestone_${m.id}_${userId}`)
    )

    if (newlyCompleted) {
      setNewMilestone(newlyCompleted)
      setShowCelebration(true)
      localStorage.setItem(`milestone_${newlyCompleted.id}_${userId}`, 'true')
      
      setTimeout(() => {
        setShowCelebration(false)
        setNewMilestone(null)
      }, 5000)
    }
  }

  const getMilestones = (analytics: UserAnalytics): Milestone[] => {
    return [
      {
        id: 'coffee_chats_5',
        title: 'Coffee Connector',
        description: 'Schedule 5 coffee chats',
        threshold: 5,
        currentValue: analytics.coffeeChatsScheduled,
        isCompleted: analytics.coffeeChatsScheduled >= 5,
        icon: '☕',
        color: 'yellow'
      },
      {
        id: 'coffee_chats_10',
        title: 'Networking Pro',
        description: 'Schedule 10 coffee chats',
        threshold: 10,
        currentValue: analytics.coffeeChatsScheduled,
        isCompleted: analytics.coffeeChatsScheduled >= 10,
        icon: '🏆',
        color: 'yellow'
      },
      {
        id: 'intros_5',
        title: 'Super Connector',
        description: 'Make 5 introductions',
        threshold: 5,
        currentValue: analytics.introsMade,
        isCompleted: analytics.introsMade >= 5,
        icon: '🤝',
        color: 'blue'
      },
      {
        id: 'intros_10',
        title: 'Network Catalyst',
        description: 'Make 10 introductions',
        threshold: 10,
        currentValue: analytics.introsMade,
        isCompleted: analytics.introsMade >= 10,
        icon: '⚡',
        color: 'blue'
      },
      {
        id: 'masterminds_3',
        title: 'Group Leader',
        description: 'Create 3 mastermind groups',
        threshold: 3,
        currentValue: analytics.mastermindsCreated,
        isCompleted: analytics.mastermindsCreated >= 3,
        icon: '🧬',
        color: 'purple'
      },
      {
        id: 'events_5',
        title: 'Event Enthusiast',
        description: 'RSVP to 5 events',
        threshold: 5,
        currentValue: analytics.eventsRSVPed,
        isCompleted: analytics.eventsRSVPed >= 5,
        icon: '🎉',
        color: 'green'
      }
    ]
  }

  const getRecentActions = () => {
    if (!userAnalytics) return []
    return userAnalytics.actions
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5)
  }

  const formatActionType = (actionType: string) => {
    switch (actionType) {
      case 'coffee_chat_scheduled': return 'Coffee Chat Scheduled'
      case 'mastermind_created': return 'Mastermind Created'
      case 'intro_made': return 'Introduction Made'
      case 'event_rsvped': return 'Event RSVP'
      case 'event_hosted': return 'Event Hosted'
      default: return actionType
    }
  }

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'coffee_chat_scheduled': return '☕'
      case 'mastermind_created': return '🧬'
      case 'intro_made': return '🤝'
      case 'event_rsvped': return '📅'
      case 'event_hosted': return '🎤'
      default: return '📊'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffDays === 0) {
      if (diffHours === 0) return 'Just now'
      return `${diffHours}h ago`
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays}d ago`
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const getMilestoneColor = (color: string) => {
    switch (color) {
      case 'yellow': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'blue': return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
      case 'purple': return 'text-purple-400 bg-purple-500/20 border-purple-500/30'
      case 'green': return 'text-green-400 bg-green-500/20 border-green-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  if (!userAnalytics) {
    return (
      <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-gray-400">No analytics data available yet</p>
          <p className="text-sm text-gray-500 mt-2">Start networking to see your impact!</p>
        </div>
      </div>
    )
  }

  const milestones = getMilestones(userAnalytics)
  const recentActions = getRecentActions()
  const completedMilestones = milestones.filter(m => m.isCompleted).length

  return (
    <div className="space-y-6">
      {/* Celebration Animation */}
      {showCelebration && newMilestone && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-zinc-900 border border-yellow-500 rounded-2xl p-8 max-w-md mx-auto text-center animate-bounce">
            <div className="text-6xl mb-4">{newMilestone.icon}</div>
            <h3 className="text-2xl font-bold text-yellow-400 mb-2">Milestone Achieved!</h3>
            <h4 className="text-xl font-semibold text-white mb-2">{newMilestone.title}</h4>
            <p className="text-gray-300">{newMilestone.description}</p>
            <div className="mt-6 text-4xl">🎉</div>
          </div>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900/70 border border-zinc-800 p-4 rounded-xl backdrop-blur-sm text-center">
          <div className="text-2xl font-bold text-yellow-400">{userAnalytics.coffeeChatsScheduled}</div>
          <div className="text-sm text-gray-400">Coffee Chats</div>
        </div>
        
        <div className="bg-zinc-900/70 border border-zinc-800 p-4 rounded-xl backdrop-blur-sm text-center">
          <div className="text-2xl font-bold text-blue-400">{userAnalytics.introsMade}</div>
          <div className="text-sm text-gray-400">Introductions</div>
        </div>
        
        <div className="bg-zinc-900/70 border border-zinc-800 p-4 rounded-xl backdrop-blur-sm text-center">
          <div className="text-2xl font-bold text-purple-400">{userAnalytics.mastermindsCreated}</div>
          <div className="text-sm text-gray-400">Masterminds</div>
        </div>
        
        <div className="bg-zinc-900/70 border border-zinc-800 p-4 rounded-xl backdrop-blur-sm text-center">
          <div className="text-2xl font-bold text-green-400">{userAnalytics.eventsRSVPed}</div>
          <div className="text-sm text-gray-400">Events</div>
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Milestones</h3>
          <span className="text-sm text-gray-400">
            {completedMilestones}/{milestones.length} completed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {milestones.map((milestone) => (
            <div
              key={milestone.id}
              className={`p-4 rounded-lg border ${
                milestone.isCompleted 
                  ? getMilestoneColor(milestone.color)
                  : 'bg-zinc-800/50 border-zinc-700 text-gray-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{milestone.icon}</span>
                  <span className="font-medium">{milestone.title}</span>
                </div>
                {milestone.isCompleted && (
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                    ✓ Complete
                  </span>
                )}
              </div>
              <p className="text-sm opacity-75 mb-3">{milestone.description}</p>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    milestone.isCompleted 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                      : 'bg-gradient-to-r from-zinc-600 to-zinc-500'
                  }`}
                  style={{ 
                    width: `${Math.min((milestone.currentValue / milestone.threshold) * 100, 100)}%` 
                  }}
                />
              </div>
              <div className="text-xs mt-2 opacity-75">
                {milestone.currentValue}/{milestone.threshold}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
        
        {recentActions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No recent activity</p>
            <p className="text-sm mt-2">Start networking to see your activity here!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActions.map((action) => (
              <div key={action.id} className="flex items-center space-x-4 p-3 bg-zinc-800/50 rounded-lg">
                <span className="text-xl">{getActionIcon(action.actionType)}</span>
                <div className="flex-1">
                  <div className="font-medium text-white">{formatActionType(action.actionType)}</div>
                  <div className="text-sm text-gray-400">{formatDate(action.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
