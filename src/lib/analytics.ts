// Analytics tracking service for user actions
export interface UserAction {
  id: string
  userId: string
  actionType: 'coffee_chat_scheduled' | 'mastermind_created' | 'intro_made' | 'event_rsvped' | 'event_hosted'
  timestamp: string
  metadata: {
    otherUserId?: string
    eventId?: string
    mastermindId?: string
    introRecipients?: string[]
    location?: string
    eventType?: string
  }
}

export interface UserAnalytics {
  userId: string
  coffeeChatsScheduled: number
  mastermindsCreated: number
  introsMade: number
  eventsRSVPed: number
  eventsHosted: number
  lastActive: string
  actions: UserAction[]
}

export interface WeeklyAnalytics {
  weekStart: string
  weekEnd: string
  totalCoffeeChats: number
  totalMasterminds: number
  totalIntros: number
  totalEvents: number
  activeUsers: number
  topUsers: {
    coffeeChats: Array<{ userId: string; name: string; count: number }>
    masterminds: Array<{ userId: string; name: string; count: number }>
    intros: Array<{ userId: string; name: string; count: number }>
    events: Array<{ userId: string; name: string; count: number }>
  }
}

class AnalyticsService {
  private static instance: AnalyticsService
  private userAnalytics: Map<string, UserAnalytics> = new Map()

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService()
    }
    return AnalyticsService.instance
  }

  // Track user actions
  async trackAction(action: Omit<UserAction, 'id' | 'timestamp'>): Promise<void> {
    const actionWithId: UserAction = {
      ...action,
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    }

    // Get or create user analytics
    let userAnalytics = this.userAnalytics.get(action.userId)
    if (!userAnalytics) {
      userAnalytics = {
        userId: action.userId,
        coffeeChatsScheduled: 0,
        mastermindsCreated: 0,
        introsMade: 0,
        eventsRSVPed: 0,
        eventsHosted: 0,
        lastActive: new Date().toISOString(),
        actions: []
      }
    }

    // Update counters based on action type
    switch (action.actionType) {
      case 'coffee_chat_scheduled':
        userAnalytics.coffeeChatsScheduled++
        break
      case 'mastermind_created':
        userAnalytics.mastermindsCreated++
        break
      case 'intro_made':
        userAnalytics.introsMade++
        break
      case 'event_rsvped':
        userAnalytics.eventsRSVPed++
        break
      case 'event_hosted':
        userAnalytics.eventsHosted++
        break
    }

    // Add action to history
    userAnalytics.actions.push(actionWithId)
    userAnalytics.lastActive = new Date().toISOString()

    // Keep only last 100 actions per user
    if (userAnalytics.actions.length > 100) {
      userAnalytics.actions = userAnalytics.actions.slice(-100)
    }

    // Store updated analytics
    this.userAnalytics.set(action.userId, userAnalytics)

    // In real app, this would save to database
    console.log('Analytics tracked:', actionWithId)
  }

  // Get user analytics
  getUserAnalytics(userId: string): UserAnalytics | null {
    return this.userAnalytics.get(userId) || null
  }

  // Get all user analytics
  getAllUserAnalytics(): UserAnalytics[] {
    return Array.from(this.userAnalytics.values())
  }

  // Get weekly analytics
  getWeeklyAnalytics(weekStart?: Date): WeeklyAnalytics {
    const start = weekStart || this.getWeekStart(new Date())
    const end = new Date(start)
    end.setDate(end.getDate() + 6)

    const weekStartStr = start.toISOString()
    const weekEndStr = end.toISOString()

    let totalCoffeeChats = 0
    let totalMasterminds = 0
    let totalIntros = 0
    let totalEvents = 0
    const activeUserIds = new Set<string>()

    const userCounts = {
      coffeeChats: new Map<string, number>(),
      masterminds: new Map<string, number>(),
      intros: new Map<string, number>(),
      events: new Map<string, number>()
    }

    // Process all user analytics
    this.userAnalytics.forEach((analytics, userId) => {
      const weekActions = analytics.actions.filter(action => {
        const actionDate = new Date(action.timestamp)
        return actionDate >= start && actionDate <= end
      })

      if (weekActions.length > 0) {
        activeUserIds.add(userId)
      }

      weekActions.forEach(action => {
        switch (action.actionType) {
          case 'coffee_chat_scheduled':
            totalCoffeeChats++
            userCounts.coffeeChats.set(userId, (userCounts.coffeeChats.get(userId) || 0) + 1)
            break
          case 'mastermind_created':
            totalMasterminds++
            userCounts.masterminds.set(userId, (userCounts.masterminds.get(userId) || 0) + 1)
            break
          case 'intro_made':
            totalIntros++
            userCounts.intros.set(userId, (userCounts.intros.get(userId) || 0) + 1)
            break
          case 'event_rsvped':
          case 'event_hosted':
            totalEvents++
            userCounts.events.set(userId, (userCounts.events.get(userId) || 0) + 1)
            break
        }
      })
    })

    // Get top users for each category
    const getTopUsers = (countMap: Map<string, number>) => {
      return Array.from(countMap.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([userId, count]) => ({
          userId,
          name: this.getUserName(userId),
          count
        }))
    }

    return {
      weekStart: weekStartStr,
      weekEnd: weekEndStr,
      totalCoffeeChats,
      totalMasterminds,
      totalIntros,
      totalEvents,
      activeUsers: activeUserIds.size,
      topUsers: {
        coffeeChats: getTopUsers(userCounts.coffeeChats),
        masterminds: getTopUsers(userCounts.masterminds),
        intros: getTopUsers(userCounts.intros),
        events: getTopUsers(userCounts.events)
      }
    }
  }

  // Helper to get week start (Monday)
  private getWeekStart(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    return new Date(d.setDate(diff))
  }

  // Mock user name lookup - in real app would query user database
  private getUserName(userId: string): string {
    const mockNames: Record<string, string> = {
      'user1': 'Sarah Kim',
      'user2': 'Marcus Chen',
      'user3': 'Jordan Rivera',
      'user4': 'Aisha Patel',
      'user5': 'David Park'
    }
    return mockNames[userId] || `User ${userId.slice(-4)}`
  }

  // Initialize with mock data for demo
  initializeMockData(): void {
    const mockActions: Array<Omit<UserAction, 'id' | 'timestamp'>> = [
      {
        userId: 'user1',
        actionType: 'coffee_chat_scheduled',
        metadata: { otherUserId: 'user2', location: 'Blue Bottle Coffee' }
      },
      {
        userId: 'user1',
        actionType: 'intro_made',
        metadata: { introRecipients: ['user3', 'user4'] }
      },
      {
        userId: 'user2',
        actionType: 'mastermind_created',
        metadata: { mastermindId: 'mastermind1' }
      },
      {
        userId: 'user3',
        actionType: 'event_rsvped',
        metadata: { eventId: 'event1', eventType: 'workshop' }
      },
      {
        userId: 'user1',
        actionType: 'event_hosted',
        metadata: { eventId: 'event2', eventType: 'social' }
      }
    ]

    // Add actions with timestamps spread over the last week
    mockActions.forEach((action, index) => {
      const timestamp = new Date()
      timestamp.setDate(timestamp.getDate() - (index % 7))
      timestamp.setHours(timestamp.getHours() - (index * 2))

      this.trackAction(action)
    })
  }
}

export const analyticsService = AnalyticsService.getInstance()

// Helper functions for components
export const trackCoffeeChatScheduled = (userId: string, otherUserId: string, location?: string) => {
  return analyticsService.trackAction({
    userId,
    actionType: 'coffee_chat_scheduled',
    metadata: { otherUserId, location }
  })
}

export const trackMastermindCreated = (userId: string, mastermindId: string) => {
  return analyticsService.trackAction({
    userId,
    actionType: 'mastermind_created',
    metadata: { mastermindId }
  })
}

export const trackIntroMade = (userId: string, introRecipients: string[]) => {
  return analyticsService.trackAction({
    userId,
    actionType: 'intro_made',
    metadata: { introRecipients }
  })
}

export const trackEventRSVP = (userId: string, eventId: string, eventType?: string) => {
  return analyticsService.trackAction({
    userId,
    actionType: 'event_rsvped',
    metadata: { eventId, eventType }
  })
}

export const trackEventHosted = (userId: string, eventId: string, eventType?: string) => {
  return analyticsService.trackAction({
    userId,
    actionType: 'event_hosted',
    metadata: { eventId, eventType }
  })
}
