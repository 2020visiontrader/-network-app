'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface WelcomeCardProps {
  user?: {
    id: string
    preferred_name?: string
    full_name?: string
    city?: string
    industries?: string[]
    profile_progress: number
    is_ambassador: boolean
    created_at: string
  }
}

interface UserStats {
  connections: number
  cities: number
  meetings: number
}

export default function WelcomeCard({ user }: WelcomeCardProps) {
  const [currentTime, setCurrentTime] = useState('')
  const [stats, setStats] = useState<UserStats>({ connections: 0, cities: 0, meetings: 0 })
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const timeString = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
      setCurrentTime(timeString)
    }

    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (user?.id) {
      loadUserStats()
    }
  }, [user?.id])

  const loadUserStats = async () => {
    if (!user?.id) return

    try {
      setIsLoadingStats(true)

      // Get total connections (other users)
      const { count: connectionsCount } = await supabase
        .from('founders')
        .select('*', { count: 'exact', head: true })
        .neq('id', user.id)
        .eq('status', 'active')

      // Get unique cities from all users (network reach)
      const { data: citiesData } = await supabase
        .from('founders')
        .select('location_city')
        .not('location_city', 'is', null)

      const uniqueCities = new Set(citiesData?.map((u: any) => u.location_city).filter(Boolean))

      // Get user's meetings count
      const { count: meetingsCount } = await supabase
        .from('coffee_chats')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      setStats({
        connections: connectionsCount || 0,
        cities: uniqueCities.size,
        meetings: meetingsCount || 0
      })

    } catch (error) {
      console.error('Error loading user stats:', error)
      // Keep default stats on error
    } finally {
      setIsLoadingStats(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const userName = user?.preferred_name || user?.full_name || 'Network Member'
  const userTagline = user?.industries?.length
    ? `${user.industries[0]} professional building meaningful connections`
    : 'Building meaningful connections'

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently'

  return (
    <div className="bg-zinc-900/70 border border-zinc-800 p-8 rounded-2xl shadow-xl backdrop-blur-sm relative overflow-hidden">
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-yellow-400/5 rounded-2xl" />

      <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 to-yellow-400 text-transparent bg-clip-text">
              {getGreeting()}, {userName} 🧠
            </h1>
          </div>

          <p className="text-gray-300 text-lg mb-3 max-w-2xl">
            "{userTagline}"
          </p>

          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>Online</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{currentTime}</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 0h6m-6 0a1 1 0 00-1 1v10a1 1 0 001 1h6a1 1 0 001-1V8a1 1 0 00-1-1" />
              </svg>
              <span>Member since {memberSince}</span>
            </div>
            {user?.city && (
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{user.city}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-3 lg:space-y-0 lg:space-x-4">
          {/* Status Badge */}
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-full shadow-lg ${
            user?.is_ambassador
              ? 'bg-gradient-to-r from-yellow-600 to-orange-500'
              : user?.profile_progress === 100
                ? 'bg-gradient-to-r from-purple-600 to-yellow-500'
                : 'bg-gradient-to-r from-gray-600 to-gray-500'
          }`}>
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-white font-semibold text-sm">
              {user?.is_ambassador ? 'Ambassador' : user?.profile_progress === 100 ? 'Network Ready' : 'Profile Incomplete'}
            </span>
          </div>

          {/* Quick Stats */}
          <div className="flex space-x-4 text-sm">
            <div className="text-center">
              <div className="text-purple-400 font-semibold">
                {isLoadingStats ? '...' : stats.connections}
              </div>
              <div className="text-gray-500 text-xs">Connections</div>
            </div>
            <div className="text-center">
              <div className="text-yellow-400 font-semibold">
                {isLoadingStats ? '...' : stats.cities}
              </div>
              <div className="text-gray-500 text-xs">Cities</div>
            </div>
            <div className="text-center">
              <div className="text-green-400 font-semibold">
                {isLoadingStats ? '...' : stats.meetings}
              </div>
              <div className="text-gray-500 text-xs">Meetings</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
