'use client'
import { useState } from 'react'

interface MastermindGroup {
  id: string
  name: string
  goal: string
  tags: string[]
  members: Array<{
    id: string
    name: string
    avatar: string
    role: string
  }>
  maxMembers: number
  cadence: string
  nextSession: {
    date: string
    time: string
  } | null
  status: 'active' | 'upcoming' | 'past'
  createdAt: string
}

interface MastermindCardProps {
  group: MastermindGroup
}

export default function MastermindCard({ group }: MastermindCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    })
  }

  const getTimeUntilSession = () => {
    if (!group.nextSession) return null
    
    const sessionDate = new Date(`${group.nextSession.date} ${group.nextSession.time}`)
    const now = new Date()
    const diffTime = sessionDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays < 7) return `In ${diffDays} days`
    return `In ${Math.ceil(diffDays / 7)} weeks`
  }

  const getStatusColor = () => {
    switch (group.status) {
      case 'active': return 'text-green-400'
      case 'upcoming': return 'text-yellow-400'
      case 'past': return 'text-gray-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = () => {
    switch (group.status) {
      case 'active': return '🟢'
      case 'upcoming': return '🟡'
      case 'past': return '⚫'
      default: return '⚫'
    }
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm transition-all duration-300 cursor-pointer ${
        isHovered 
          ? 'transform scale-105 shadow-2xl border-purple-500/50 bg-zinc-900/90' 
          : 'hover:border-zinc-700'
      }`}
    >
      {/* Glow Effect */}
      {isHovered && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-yellow-400/10 rounded-2xl" />
      )}
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🧬</span>
            <span className={`text-xs font-medium ${getStatusColor()}`}>
              {getStatusIcon()} {group.status.toUpperCase()}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {group.cadence}
          </div>
        </div>

        {/* Group Name & Goal */}
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
          {group.name}
        </h3>
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
          {group.goal}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {group.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-purple-600/20 text-purple-300 text-xs rounded-full border border-purple-500/30"
            >
              {tag}
            </span>
          ))}
          {group.tags.length > 3 && (
            <span className="px-2 py-1 bg-zinc-700 text-gray-400 text-xs rounded-full">
              +{group.tags.length - 3}
            </span>
          )}
        </div>

        {/* Members */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Members</span>
            <span className="text-xs text-gray-500">
              {group.members.length}/{group.maxMembers}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-2">
              {group.members.slice(0, 4).map((member, index) => (
                <div
                  key={member.id}
                  className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center border-2 border-zinc-900 text-sm"
                  title={member.name}
                >
                  {member.avatar}
                </div>
              ))}
              {group.members.length > 4 && (
                <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center border-2 border-zinc-900 text-xs text-gray-400">
                  +{group.members.length - 4}
                </div>
              )}
            </div>
            {group.members.length < group.maxMembers && (
              <div className="w-8 h-8 bg-zinc-800 border-2 border-dashed border-zinc-600 rounded-full flex items-center justify-center">
                <span className="text-xs text-gray-500">+</span>
              </div>
            )}
          </div>
        </div>

        {/* Next Session */}
        {group.nextSession ? (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-yellow-400">Next Session</div>
                <div className="text-xs text-gray-300">
                  {formatDate(group.nextSession.date)} at {group.nextSession.time}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-yellow-400 font-medium">
                  {getTimeUntilSession()}
                </div>
                <button className="text-xs text-yellow-300 hover:text-yellow-200 transition">
                  Add to Calendar
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 mb-4">
            <div className="text-sm text-gray-400 text-center">
              No upcoming sessions scheduled
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition text-sm">
            View Group
          </button>
          {group.status === 'active' && (
            <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-gray-300 rounded-lg transition text-sm">
              ⚙️
            </button>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="mt-4 pt-4 border-t border-zinc-700">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Group Progress</span>
            <span>{Math.round((group.members.length / group.maxMembers) * 100)}% Full</span>
          </div>
          <div className="mt-2 w-full bg-zinc-800 rounded-full h-1">
            <div 
              className="bg-gradient-to-r from-purple-500 to-yellow-400 h-1 rounded-full transition-all duration-300"
              style={{ width: `${(group.members.length / group.maxMembers) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
