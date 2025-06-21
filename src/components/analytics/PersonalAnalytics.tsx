'use client'
import { useState, useEffect } from 'react'
// import { analyticsService, UserAnalytics } from '@/lib/analytics'

interface PersonalAnalyticsProps {
  userId: string
}

interface UserAnalytics {
  coffeeChatsScheduled: number;
  introsMade: number;
  mastermindsCreated: number;
  eventsRSVPed: number;
  profileCompleteness: number;
  connectionsCount: number;
  activeDays: number;
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
    // const analytics = analyticsService.getUserAnalytics(userId)
    // if (analytics) {
    //   setUserAnalytics(analytics)
    //   checkForNewMilestones(analytics)
    // }
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
        currentValue: analytics?.coffeeChatsScheduled || 0,
        isCompleted: (analytics?.coffeeChatsScheduled || 0) >= 5,
        icon: '☕',
        color: 'yellow'
      },
      {
        id: 'coffee_chats_10',
        title: 'Networking Pro',
        description: 'Schedule 10 coffee chats',
        threshold: 10,
        currentValue: analytics?.coffeeChatsScheduled || 0,
        isCompleted: (analytics?.coffeeChatsScheduled || 0) >= 10,
        icon: '🏆',
        color: 'yellow'
      },
      {
        id: 'intros_5',
        title: 'Super Connector',
        description: 'Make 5 introductions',
        threshold: 5,
        currentValue: analytics?.introsMade || 0,
        isCompleted: (analytics?.introsMade || 0) >= 5,
        icon: '🤝',
        color: 'blue'
      },
      {
        id: 'intros_10',
        title: 'Network Catalyst',
        description: 'Make 10 introductions',
        threshold: 10,
        currentValue: analytics?.introsMade || 0,
        isCompleted: (analytics?.introsMade || 0) >= 10,
        icon: '⚡',
        color: 'blue'
      },
      {
        id: 'masterminds_3',
        title: 'Group Leader',
        description: 'Create 3 mastermind groups',
        threshold: 3,
        currentValue: analytics?.mastermindsCreated || 0,
        isCompleted: (analytics?.mastermindsCreated || 0) >= 3,
        icon: '🧬',
        color: 'purple'
      },
      {
        id: 'events_5',
        title: 'Event Enthusiast',
        description: 'RSVP to 5 events',
        threshold: 5,
        currentValue: analytics?.eventsRSVPed || 0,
        isCompleted: (analytics?.eventsRSVPed || 0) >= 5,
        icon: '🎉',
        color: 'green'
      }
    ]
  }

  const getRecentActions = () => {
    if (!userAnalytics) return []
    return []
    // return userAnalytics.actions
    //   .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    //   .slice(0, 5)
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
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Analytics cards will go here */}
    </div>
  );
}
