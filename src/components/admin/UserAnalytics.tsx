'use client'
import { useState, useEffect } from 'react'
import { analyticsService, WeeklyAnalytics, UserAnalytics as UserAnalyticsType } from '@/lib/analytics'

interface AnalyticsData {
  totalUsers: number
  activeUsers: number
  newSignups: number
  coffeeChats: number
  masterminds: number
  events: number
  referrals: number
  conversionRate: number
}

const mockUserActivity = [
  { date: '2024-01-15', signups: 3, coffeeChats: 12, events: 2 },
  { date: '2024-01-14', signups: 2, coffeeChats: 8, events: 1 },
  { date: '2024-01-13', signups: 4, coffeeChats: 15, events: 0 },
  { date: '2024-01-12', signups: 1, coffeeChats: 10, events: 1 },
  { date: '2024-01-11', signups: 2, coffeeChats: 14, events: 3 }
]

export default function UserAnalytics() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d')
  const [weeklyAnalytics, setWeeklyAnalytics] = useState<WeeklyAnalytics | null>(null)
  const [userAnalytics, setUserAnalytics] = useState<UserAnalyticsType[]>([])

  useEffect(() => {
    // Initialize mock data and load analytics
    analyticsService.initializeMockData()

    const weekly = analyticsService.getWeeklyAnalytics()
    const users = analyticsService.getAllUserAnalytics()

    setWeeklyAnalytics(weekly)
    setUserAnalytics(users)
  }, [timeRange])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getEngagementRate = () => {
    if (!weeklyAnalytics) return 0
    return Math.round((weeklyAnalytics.activeUsers / userAnalytics.length) * 100)
  }

  const getGrowthTrend = () => {
    // Mock calculation - in real app would compare to previous period
    return '+12%'
  }

  if (!weeklyAnalytics) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">User Analytics</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Total Users</h3>
            <span className="text-green-400 text-sm">{getGrowthTrend()}</span>
          </div>
          <div className="text-2xl font-bold text-white">{userAnalytics.length}</div>
          <div className="text-xs text-gray-500 mt-1">
            {weeklyAnalytics.activeUsers} active this week
          </div>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Coffee Chats</h3>
            <span className="text-yellow-400 text-sm">+8%</span>
          </div>
          <div className="text-2xl font-bold text-white">{weeklyAnalytics.totalCoffeeChats}</div>
          <div className="text-xs text-gray-500 mt-1">
            This week
          </div>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Masterminds</h3>
            <span className="text-purple-400 text-sm">+15%</span>
          </div>
          <div className="text-2xl font-bold text-white">{weeklyAnalytics.totalMasterminds}</div>
          <div className="text-xs text-gray-500 mt-1">
            Created this week
          </div>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Introductions</h3>
            <span className="text-blue-400 text-sm">+22%</span>
          </div>
          <div className="text-2xl font-bold text-white">{weeklyAnalytics.totalIntros}</div>
          <div className="text-xs text-gray-500 mt-1">
            Made this week
          </div>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm">
        <h3 className="font-medium text-white mb-6">Daily Activity</h3>
        <div className="space-y-4">
          {mockUserActivity.map((day, index) => (
            <div key={day.date} className="flex items-center space-x-4">
              <div className="w-20 text-sm text-gray-400">
                {formatDate(day.date)}
              </div>

              <div className="flex-1 grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-300">Signups: {day.signups}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <span className="text-sm text-gray-300">Chats: {day.coffeeChats}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                  <span className="text-sm text-gray-300">Events: {day.events}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm">
          <h3 className="font-medium text-white mb-4">Feature Usage</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Coffee Chats</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-zinc-800 rounded-full h-2">
                  <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <span className="text-sm text-gray-400">85%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-300">Masterminds</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-zinc-800 rounded-full h-2">
                  <div className="bg-purple-400 h-2 rounded-full" style={{ width: '62%' }}></div>
                </div>
                <span className="text-sm text-gray-400">62%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-300">Events</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-zinc-800 rounded-full h-2">
                  <div className="bg-blue-400 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <span className="text-sm text-gray-400">45%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-300">Referrals</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-zinc-800 rounded-full h-2">
                  <div className="bg-green-400 h-2 rounded-full" style={{ width: '38%' }}></div>
                </div>
                <span className="text-sm text-gray-400">38%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm">
          <h3 className="font-medium text-white mb-4">Top Performers This Week</h3>
          <div className="space-y-4">
            {/* Coffee Chats Leader */}
            {weeklyAnalytics.topUsers.coffeeChats.length > 0 && (
              <div>
                <div className="text-sm text-yellow-400 mb-2">☕ Coffee Chats</div>
                {weeklyAnalytics.topUsers.coffeeChats.slice(0, 2).map((user, index) => (
                  <div key={user.userId} className="flex items-center justify-between p-2 bg-zinc-800/50 rounded-lg mb-2">
                    <div>
                      <div className="font-medium text-white">{user.name}</div>
                      <div className="text-sm text-gray-400">{user.count} chats scheduled</div>
                    </div>
                    <div className="text-yellow-400 text-sm">{index === 0 ? '🏆' : '🥈'}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Masterminds Leader */}
            {weeklyAnalytics.topUsers.masterminds.length > 0 && (
              <div>
                <div className="text-sm text-purple-400 mb-2">🧬 Masterminds</div>
                {weeklyAnalytics.topUsers.masterminds.slice(0, 2).map((user, index) => (
                  <div key={user.userId} className="flex items-center justify-between p-2 bg-zinc-800/50 rounded-lg mb-2">
                    <div>
                      <div className="font-medium text-white">{user.name}</div>
                      <div className="text-sm text-gray-400">{user.count} groups created</div>
                    </div>
                    <div className="text-purple-400 text-sm">{index === 0 ? '🏆' : '🥈'}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Intros Leader */}
            {weeklyAnalytics.topUsers.intros.length > 0 && (
              <div>
                <div className="text-sm text-blue-400 mb-2">🤝 Introductions</div>
                {weeklyAnalytics.topUsers.intros.slice(0, 2).map((user, index) => (
                  <div key={user.userId} className="flex items-center justify-between p-2 bg-zinc-800/50 rounded-lg mb-2">
                    <div>
                      <div className="font-medium text-white">{user.name}</div>
                      <div className="text-sm text-gray-400">{user.count} intros made</div>
                    </div>
                    <div className="text-blue-400 text-sm">{index === 0 ? '🏆' : '🥈'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm">
        <h3 className="font-medium text-white mb-4">Export Data</h3>
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition text-sm">
            Export CSV
          </button>
          <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition text-sm">
            Generate Report
          </button>
          <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition text-sm">
            Schedule Email
          </button>
        </div>
      </div>
    </div>
  )
}
