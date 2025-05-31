'use client'
import { useState } from 'react'

interface StatusData {
  text: string
  intensity: 'casual' | 'semi-active' | 'urgent'
  expiresAt: string
  isActive: boolean
  updatedAt: string
}

interface StatusDisplayProps {
  status: StatusData
  userName: string
  size?: 'small' | 'medium' | 'large'
  showTooltip?: boolean
}

export default function StatusDisplay({ status, userName, size = 'medium', showTooltip = true }: StatusDisplayProps) {
  const [showFullStatus, setShowFullStatus] = useState(false)

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'casual':
        return {
          ring: 'ring-yellow-400/50',
          bg: 'bg-yellow-500/20',
          text: 'text-yellow-400',
          glow: 'shadow-yellow-400/30'
        }
      case 'semi-active':
        return {
          ring: 'ring-green-400/60',
          bg: 'bg-green-500/20',
          text: 'text-green-400',
          glow: 'shadow-green-400/40'
        }
      case 'urgent':
        return {
          ring: 'ring-red-400/70',
          bg: 'bg-red-500/20',
          text: 'text-red-400',
          glow: 'shadow-red-400/50'
        }
      default:
        return {
          ring: 'ring-gray-400/50',
          bg: 'bg-gray-500/20',
          text: 'text-gray-400',
          glow: 'shadow-gray-400/30'
        }
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'px-2 py-1',
          text: 'text-xs',
          ring: 'ring-1',
          maxWidth: 'max-w-32'
        }
      case 'medium':
        return {
          container: 'px-3 py-2',
          text: 'text-sm',
          ring: 'ring-2',
          maxWidth: 'max-w-48'
        }
      case 'large':
        return {
          container: 'px-4 py-3',
          text: 'text-base',
          ring: 'ring-2',
          maxWidth: 'max-w-64'
        }
      default:
        return {
          container: 'px-3 py-2',
          text: 'text-sm',
          ring: 'ring-2',
          maxWidth: 'max-w-48'
        }
    }
  }

  const colors = getIntensityColor(status.intensity)
  const sizeClasses = getSizeClasses()

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const getMaxTextLength = () => {
    switch (size) {
      case 'small': return 20
      case 'medium': return 35
      case 'large': return 50
      default: return 35
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const updated = new Date(dateString)
    const diffMs = now.getTime() - updated.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return `${diffDays}d ago`
    } else if (diffHours > 0) {
      return `${diffHours}h ago`
    } else {
      return 'Just now'
    }
  }

  const displayText = truncateText(status.text, getMaxTextLength())
  const isUrgent = status.intensity === 'urgent'

  return (
    <div className="relative inline-block">
      <div
        className={`
          ${sizeClasses.container} ${sizeClasses.ring} ${colors.ring} ${colors.bg} ${colors.glow}
          rounded-full ${sizeClasses.maxWidth} cursor-pointer transition-all duration-200
          hover:scale-105 ${isUrgent ? 'animate-pulse' : ''}
        `}
        onMouseEnter={() => setShowFullStatus(true)}
        onMouseLeave={() => setShowFullStatus(false)}
      >
        <div className={`${colors.text} ${sizeClasses.text} font-medium truncate`}>
          {displayText}
        </div>
      </div>

      {/* Tooltip */}
      {showTooltip && showFullStatus && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-xl backdrop-blur-sm min-w-64 max-w-80">
            <div className="flex items-start justify-between mb-2">
              <div className="font-medium text-white text-sm">{userName}'s Status</div>
              <div className={`px-2 py-1 rounded-full text-xs ${colors.bg} ${colors.text} border border-current`}>
                {status.intensity}
              </div>
            </div>
            
            <div className="text-white text-sm mb-2">{status.text}</div>
            
            <div className="text-xs text-gray-400">
              Updated {formatTimeAgo(status.updatedAt)}
            </div>
            
            {showTooltip && (
              <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-zinc-700">
                💡 This status helps others understand how to connect with them right now
              </div>
            )}
          </div>
          
          {/* Tooltip Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
            <div className="border-4 border-transparent border-t-zinc-700"></div>
          </div>
        </div>
      )}

      {/* Pulsing ring for urgent status */}
      {isUrgent && (
        <div className={`absolute inset-0 ${colors.ring} rounded-full animate-ping opacity-75`} />
      )}
    </div>
  )
}
