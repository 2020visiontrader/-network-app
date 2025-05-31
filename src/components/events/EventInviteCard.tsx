'use client'
import { useState } from 'react'

interface EventInvite {
  id: string
  title: string
  host: {
    name: string
    avatar: string
    role: string
  }
  date: string
  time: string
  location: string
  type: string
  description: string
  attendees: Array<{
    id: string
    name: string
    avatar: string
    isConnected: boolean
  }>
  rsvpStatus: 'pending' | 'attending' | 'declined'
}

interface EventInviteCardProps {
  invite: EventInvite
  onRSVP: (eventId: string, status: 'attending' | 'declined') => void
}

export default function EventInviteCard({ invite, onRSVP }: EventInviteCardProps) {
  const [isRSVPing, setIsRSVPing] = useState(false)
  const [showAttendees, setShowAttendees] = useState(false)

  const handleRSVP = async (status: 'attending' | 'declined') => {
    setIsRSVPing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      onRSVP(invite.id, status)
    } finally {
      setIsRSVPing(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getTypeIcon = (type: string) => {
    const icons = {
      workshop: '🎯',
      mastermind: '🧬',
      social: '🍷',
      charity: '❤️',
      launch: '🚀'
    }
    return icons[type as keyof typeof icons] || '📅'
  }

  const connectedAttendees = invite.attendees.filter(a => a.isConnected)
  const totalAttendees = invite.attendees.length

  return (
    <div className={`bg-zinc-900/70 border rounded-2xl shadow-xl backdrop-blur-sm transition-all duration-300 ${
      invite.rsvpStatus === 'pending'
        ? 'border-yellow-500/50 shadow-yellow-500/20'
        : invite.rsvpStatus === 'attending'
        ? 'border-green-500/50 shadow-green-500/20'
        : 'border-zinc-800'
    }`}>
      {/* Honeycomb border animation for pending invites */}
      {invite.rsvpStatus === 'pending' && (
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-purple-500/10 rounded-2xl animate-pulse" />
      )}

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-xl">{getTypeIcon(invite.type)}</span>
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg">{invite.title}</h3>
              <p className="text-sm text-gray-400">
                You've been invited by {invite.host.name}
              </p>
            </div>
          </div>

          {invite.rsvpStatus !== 'pending' && (
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              invite.rsvpStatus === 'attending'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
            }`}>
              {invite.rsvpStatus === 'attending' ? '✅ Attending' : '❌ Declined'}
            </div>
          )}
        </div>

        {/* Host Info */}
        <div className="flex items-center space-x-3 mb-4 p-3 bg-zinc-800/30 rounded-lg">
          <span className="text-2xl">{invite.host.avatar}</span>
          <div>
            <div className="font-medium text-white">{invite.host.name}</div>
            <div className="text-sm text-gray-400">{invite.host.role}</div>
          </div>
        </div>

        {/* Event Details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center space-x-3 text-sm">
            <span className="text-purple-400">📅</span>
            <span className="text-white">{formatDate(invite.date)} at {invite.time}</span>
          </div>

          {invite.location && (
            <div className="flex items-center space-x-3 text-sm">
              <span className="text-purple-400">📍</span>
              <span className="text-white">{invite.location}</span>
            </div>
          )}

          <div className="flex items-center space-x-3 text-sm">
            <span className="text-purple-400">👥</span>
            <span className="text-white">
              {totalAttendees} attending
              {connectedAttendees.length > 0 && (
                <span className="text-gray-400">
                  {' '}• {connectedAttendees.length} you know
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Description */}
        {invite.description && (
          <div className="mb-6">
            <p className="text-gray-300 text-sm leading-relaxed">{invite.description}</p>
          </div>
        )}

        {/* Attendees Preview */}
        {connectedAttendees.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setShowAttendees(!showAttendees)}
              className="flex items-center space-x-2 text-sm text-purple-400 hover:text-purple-300 transition"
            >
              <span>People you know attending</span>
              <svg
                className={`w-4 h-4 transition-transform ${showAttendees ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showAttendees && (
              <div className="mt-3 space-y-2">
                {connectedAttendees.slice(0, 5).map(attendee => (
                  <div key={attendee.id} className="flex items-center space-x-3 p-2 bg-zinc-800/30 rounded-lg">
                    <span className="text-lg">{attendee.avatar}</span>
                    <span className="text-sm text-white">{attendee.name}</span>
                  </div>
                ))}
                {connectedAttendees.length > 5 && (
                  <div className="text-xs text-gray-500 pl-2">
                    +{connectedAttendees.length - 5} more you know
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* RSVP Buttons */}
        {invite.rsvpStatus === 'pending' && (
          <div className="flex space-x-3">
            <button
              onClick={() => handleRSVP('attending')}
              disabled={isRSVPing}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRSVPing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>RSVPing...</span>
                </div>
              ) : (
                "✅ I'll Attend"
              )}
            </button>

            <button
              onClick={() => handleRSVP('declined')}
              disabled={isRSVPing}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ❌ Can't Make It
            </button>
          </div>
        )}

        {/* Change RSVP */}
        {invite.rsvpStatus !== 'pending' && (
          <div className="text-center">
            <button className="text-sm text-gray-400 hover:text-white transition">
              Change RSVP
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
