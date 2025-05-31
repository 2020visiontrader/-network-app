'use client'

interface BadgeIconProps {
  size?: 'small' | 'medium' | 'large'
  showLabel?: boolean
  animated?: boolean
}

export default function BadgeIcon({ size = 'medium', showLabel = true, animated = true }: BadgeIconProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'small': return 'w-6 h-6'
      case 'medium': return 'w-8 h-8'
      case 'large': return 'w-12 h-12'
      default: return 'w-8 h-8'
    }
  }

  const getTextSize = () => {
    switch (size) {
      case 'small': return 'text-xs'
      case 'medium': return 'text-sm'
      case 'large': return 'text-base'
      default: return 'text-sm'
    }
  }

  const getIconSize = () => {
    switch (size) {
      case 'small': return 'w-3 h-3'
      case 'medium': return 'w-4 h-4'
      case 'large': return 'w-6 h-6'
      default: return 'w-4 h-4'
    }
  }

  return (
    <div className={`inline-flex items-center space-x-2 ${showLabel ? '' : 'justify-center'}`}>
      {/* Hexagonal Badge */}
      <div className={`relative ${getSizeClasses()} flex items-center justify-center`}>
        {/* Pulsing glow effect */}
        {animated && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-yellow-400 rounded-full animate-ping opacity-75" />
        )}
        
        {/* Main badge */}
        <div className={`relative ${getSizeClasses()} bg-gradient-to-r from-purple-600 to-yellow-500 rounded-full flex items-center justify-center shadow-lg ${animated ? 'animate-pulse' : ''}`}>
          {/* Hexagon SVG */}
          <svg 
            className={getIconSize()} 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M17.5 3.5L22 12L17.5 20.5H6.5L2 12L6.5 3.5H17.5Z" 
              fill="white" 
              stroke="white" 
              strokeWidth="1.5"
            />
            {/* Inner pattern */}
            <circle cx="12" cy="8" r="1.5" fill="currentColor" className="text-purple-600"/>
            <circle cx="8" cy="12" r="1.5" fill="currentColor" className="text-purple-600"/>
            <circle cx="16" cy="12" r="1.5" fill="currentColor" className="text-purple-600"/>
            <circle cx="12" cy="16" r="1.5" fill="currentColor" className="text-purple-600"/>
            <line x1="12" y1="8" x2="8" y2="12" stroke="currentColor" strokeWidth="1" className="text-purple-600"/>
            <line x1="12" y1="8" x2="16" y2="12" stroke="currentColor" strokeWidth="1" className="text-purple-600"/>
            <line x1="8" y1="12" x2="12" y2="16" stroke="currentColor" strokeWidth="1" className="text-purple-600"/>
            <line x1="16" y1="12" x2="12" y2="16" stroke="currentColor" strokeWidth="1" className="text-purple-600"/>
          </svg>
        </div>

        {/* Sparkle effects for large size */}
        {size === 'large' && animated && (
          <>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
            <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
            <div className="absolute top-0 left-0 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '1.5s' }} />
          </>
        )}
      </div>

      {/* Label */}
      {showLabel && (
        <span className={`font-semibold bg-gradient-to-r from-purple-400 to-yellow-400 text-transparent bg-clip-text ${getTextSize()}`}>
          Hive Ambassador 🟣
        </span>
      )}
    </div>
  )
}
