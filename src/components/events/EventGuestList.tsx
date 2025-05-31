'use client'
import { useState } from 'react'

interface Guest {
  id: string
  name: string
  avatar: string
  role: string
  isCoHost?: boolean
}

interface EventGuestListProps {
  guests: Guest[]
  onRemoveGuest: (guestId: string) => void
  onToggleCoHost: (guestId: string) => void
  onAddGuest: (guest: Guest) => void
}

const mockConnections = [
  { id: '4', name: 'Aisha Patel', avatar: '🧘‍♀️', role: 'Wellness Entrepreneur' },
  { id: '5', name: 'David Park', avatar: '🌱', role: 'Climate Investor' },
  { id: '6', name: 'Elena Rodriguez', avatar: '👩‍🚀', role: 'Web3 Founder' },
  { id: '7', name: 'James Wilson', avatar: '👨‍💼', role: 'Product Manager' },
  { id: '8', name: 'Maya Singh', avatar: '👩‍💻', role: 'AI Researcher' },
  { id: '9', name: 'Carlos Martinez', avatar: '🎯', role: 'Growth Lead' }
]

export default function EventGuestList({ guests, onRemoveGuest, onToggleCoHost, onAddGuest }: EventGuestListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddGuests, setShowAddGuests] = useState(false)

  const filteredConnections = mockConnections.filter(connection => 
    connection.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !guests.find(guest => guest.id === connection.id)
  )

  const coHosts = guests.filter(guest => guest.isCoHost)
  const regularGuests = guests.filter(guest => !guest.isCoHost)

  return (
    <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-purple-400">Guest List</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-400">
            {guests.length} invited
          </span>
          <button
            type="button"
            onClick={() => setShowAddGuests(!showAddGuests)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition text-sm"
          >
            Add Guests
          </button>
        </div>
      </div>

      {/* Add Guests Section */}
      {showAddGuests && (
        <div className="mb-6 p-4 bg-zinc-800/30 border border-zinc-700 rounded-lg">
          <div className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your connections..."
              className="w-full px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
            />
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2">
            {filteredConnections.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                {searchQuery ? 'No connections found' : 'All connections already invited'}
              </div>
            ) : (
              filteredConnections.map(connection => (
                <div key={connection.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800/70 transition">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{connection.avatar}</span>
                    <div>
                      <div className="font-medium text-white">{connection.name}</div>
                      <div className="text-sm text-gray-400">{connection.role}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onAddGuest(connection)
                      setSearchQuery('')
                    }}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition"
                  >
                    Invite
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Co-Hosts */}
      {coHosts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-yellow-400 mb-3 flex items-center space-x-2">
            <span>👑</span>
            <span>Co-Hosts ({coHosts.length})</span>
          </h3>
          <div className="space-y-2">
            {coHosts.map(guest => (
              <div key={guest.id} className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{guest.avatar}</span>
                  <div>
                    <div className="font-medium text-white">{guest.name}</div>
                    <div className="text-sm text-gray-400">{guest.role}</div>
                  </div>
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                    Co-Host
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => onToggleCoHost(guest.id)}
                    className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-gray-300 rounded text-sm transition"
                  >
                    Remove Co-Host
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveGuest(guest.id)}
                    className="px-3 py-1 text-red-400 hover:text-red-300 transition text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Guests */}
      {regularGuests.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3">
            Guests ({regularGuests.length})
          </h3>
          <div className="space-y-2">
            {regularGuests.map(guest => (
              <div key={guest.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{guest.avatar}</span>
                  <div>
                    <div className="font-medium text-white">{guest.name}</div>
                    <div className="text-sm text-gray-400">{guest.role}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => onToggleCoHost(guest.id)}
                    className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm transition"
                  >
                    Make Co-Host
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveGuest(guest.id)}
                    className="px-3 py-1 text-red-400 hover:text-red-300 transition text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {guests.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👥</span>
          </div>
          <p className="mb-2">No guests invited yet</p>
          <p className="text-sm">Add people from your verified connections</p>
        </div>
      )}

      {/* Guest Limit Info */}
      <div className="mt-6 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-purple-400">💡</span>
          <span className="text-gray-300">
            You can invite up to 50 people. Quality connections make better events.
          </span>
        </div>
      </div>
    </div>
  )
}
