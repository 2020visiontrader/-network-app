'use client'
import { useState, useEffect } from 'react'

interface StatusData {
  text: string
  intensity: 'casual' | 'semi-active' | 'urgent'
  expiresAt: string
  isActive: boolean
  updatedAt: string
}

interface StatusUpdateProps {
  currentStatus?: StatusData | null
  onStatusUpdate: (status: StatusData) => void
  onStatusClear: () => void
}

const intensityOptions = [
  {
    value: 'casual',
    label: 'Casual',
    description: 'Low priority, when convenient',
    color: 'yellow',
    glowClass: 'shadow-yellow-400/30'
  },
  {
    value: 'semi-active',
    label: 'Semi-Active',
    description: 'Moderately important, this week',
    color: 'green',
    glowClass: 'shadow-green-400/40'
  },
  {
    value: 'urgent',
    label: 'Urgent',
    description: 'Time-sensitive, respond soon',
    color: 'red',
    glowClass: 'shadow-red-400/50'
  }
]

const statusSuggestions = [
  "In Jakarta for Web3 Summit",
  "Looking for co-founder in HealthTech",
  "Available for coffee chats this week",
  "Speaking at TechCrunch Disrupt",
  "Fundraising Series A - open to intros",
  "In SF for investor meetings",
  "Hosting climate tech dinner Thursday",
  "Looking for AI/ML advisors"
]

export default function StatusUpdate({ currentStatus, onStatusUpdate, onStatusClear }: StatusUpdateProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [intensity, setIntensity] = useState<'casual' | 'semi-active' | 'urgent'>('casual')
  const [timeRemaining, setTimeRemaining] = useState('')

  useEffect(() => {
    if (currentStatus) {
      setStatusText(currentStatus.text)
      setIntensity(currentStatus.intensity)

      // Calculate time remaining
      const updateTimeRemaining = () => {
        const now = new Date()
        const expires = new Date(currentStatus.expiresAt)
        const diff = expires.getTime() - now.getTime()

        if (diff <= 0) {
          setTimeRemaining('Expired')
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24))
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

          if (days > 0) {
            setTimeRemaining(`${days}d ${hours}h remaining`)
          } else {
            setTimeRemaining(`${hours}h remaining`)
          }
        }
      }

      updateTimeRemaining()
      const interval = setInterval(updateTimeRemaining, 60000) // Update every minute

      return () => clearInterval(interval)
    }
  }, [currentStatus])

  const handleSave = () => {
    if (statusText.trim()) {
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

      onStatusUpdate({
        text: statusText.trim(),
        intensity,
        expiresAt: expiresAt.toISOString(),
        isActive: true,
        updatedAt: new Date().toISOString()
      })
      setIsEditing(false)
    }
  }

  const handleClear = () => {
    onStatusClear()
    setStatusText('')
    setIsEditing(false)
  }

  const getIntensityStyle = (intensityValue: string) => {
    const option = intensityOptions.find(opt => opt.value === intensityValue)
    if (!option) return ''

    switch (option.color) {
      case 'yellow':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
      case 'green':
        return 'bg-green-500/20 border-green-500/50 text-green-400'
      case 'red':
        return 'bg-red-500/20 border-red-500/50 text-red-400'
      default:
        return 'bg-gray-500/20 border-gray-500/50 text-gray-400'
    }
  }

  const getGlowClass = (intensityValue: string) => {
    const option = intensityOptions.find(opt => opt.value === intensityValue)
    return option?.glowClass || ''
  }

  if (!isEditing && !currentStatus) {
    return (
      <div className="bg-zinc-900/70 border border-zinc-800 p-4 rounded-xl backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-white mb-1">Live Status</h3>
            <p className="text-sm text-gray-400">Let others know what you're up to</p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition text-sm"
          >
            Set Status
          </button>
        </div>
      </div>
    )
  }

  if (!isEditing && currentStatus) {
    return (
      <div className={`bg-zinc-900/70 border border-zinc-800 p-4 rounded-xl backdrop-blur-sm relative ${getGlowClass(currentStatus.intensity)}`}>
        {/* Pulsing animation for urgent status */}
        {currentStatus.intensity === 'urgent' && (
          <div className="absolute inset-0 bg-red-500/10 rounded-xl animate-pulse" />
        )}

        <div className="relative">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-medium text-white">Live Status</h3>
                <div className={`px-2 py-1 rounded-full text-xs border ${getIntensityStyle(currentStatus.intensity)}`}>
                  {intensityOptions.find(opt => opt.value === currentStatus.intensity)?.label}
                </div>
              </div>
              <p className="text-white">{currentStatus.text}</p>
              <p className="text-xs text-gray-500 mt-2">{timeRemaining}</p>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-gray-400 hover:text-white transition"
              >
                Edit
              </button>
              <button
                onClick={handleClear}
                className="text-xs text-red-400 hover:text-red-300 transition"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            💡 This status helps others understand how to connect with you right now
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm">
      <h3 className="font-medium text-white mb-4">Update Your Status</h3>

      {/* Status Text Input */}
      <div className="mb-4">
        <textarea
          value={statusText}
          onChange={(e) => setStatusText(e.target.value)}
          placeholder="What's happening? Where are you? What do you need?"
          maxLength={80}
          rows={2}
          className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 resize-none"
        />
        <div className="flex items-center justify-between mt-2">
          <span className={`text-xs ${statusText.length > 70 ? 'text-yellow-400' : 'text-gray-500'}`}>
            {statusText.length}/80 characters
          </span>
        </div>
      </div>

      {/* Quick Suggestions */}
      <div className="mb-4">
        <p className="text-sm text-gray-400 mb-2">Quick suggestions:</p>
        <div className="flex flex-wrap gap-2">
          {statusSuggestions.slice(0, 4).map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setStatusText(suggestion)}
              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-gray-300 rounded-full text-xs transition"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Intensity Selection */}
      <div className="mb-6">
        <p className="text-sm text-gray-300 mb-3">Intensity Level</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {intensityOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setIntensity(option.value as 'casual' | 'semi-active' | 'urgent')}
              className={`p-3 rounded-lg border text-left transition ${
                intensity === option.value
                  ? getIntensityStyle(option.value)
                  : 'bg-zinc-800/50 border-zinc-700 text-gray-400 hover:border-zinc-600'
              }`}
            >
              <div className="font-medium text-sm">{option.label}</div>
              <div className="text-xs opacity-75">{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Auto-expire Info */}
      <div className="mb-6 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
        <p className="text-sm text-purple-400">
          ⏰ Status will automatically expire in 7 days unless extended
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={() => setIsEditing(false)}
          className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!statusText.trim()}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
            statusText.trim()
              ? 'bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600 text-white'
              : 'bg-zinc-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          Save Status
        </button>
      </div>
    </div>
  )
}
