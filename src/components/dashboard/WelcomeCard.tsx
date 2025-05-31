'use client'
import { useState, useEffect } from 'react'

interface WelcomeCardProps {
  user?: {
    preferred_name?: string
    full_name?: string
    tagline?: string
    onboarding_completed?: boolean
  }
}

export default function WelcomeCard({ user }: WelcomeCardProps) {
  const [currentTime, setCurrentTime] = useState('')

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

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const userName = user?.preferred_name || user?.full_name || 'Network Member'
  const userTagline = user?.tagline || 'Building meaningful connections'

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
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-3 lg:space-y-0 lg:space-x-4">
          {/* Network Ready Badge */}
          <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-yellow-500 px-4 py-2 rounded-full shadow-lg">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-white font-semibold text-sm">Network Ready</span>
          </div>

          {/* Quick Stats */}
          <div className="flex space-x-4 text-sm">
            <div className="text-center">
              <div className="text-purple-400 font-semibold">27</div>
              <div className="text-gray-500 text-xs">Connections</div>
            </div>
            <div className="text-center">
              <div className="text-yellow-400 font-semibold">5</div>
              <div className="text-gray-500 text-xs">Cities</div>
            </div>
            <div className="text-center">
              <div className="text-green-400 font-semibold">12</div>
              <div className="text-gray-500 text-xs">Meetings</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
