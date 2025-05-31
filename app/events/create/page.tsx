'use client'
import { useState } from 'react'
import HiveHexGrid from '@/components/HiveHexGrid'
import EventGuestList from '@/components/events/EventGuestList'

interface EventFormData {
  title: string
  date: string
  time: string
  location: string
  type: string
  description: string
  visibility: 'connections' | 'open_invite'
  guestList: Array<{
    id: string
    name: string
    avatar: string
    role: string
    isCoHost?: boolean
  }>
}

const eventTypes = [
  { value: 'workshop', label: 'Workshop', icon: '🎯' },
  { value: 'mastermind', label: 'Mastermind', icon: '🧬' },
  { value: 'social', label: 'Social', icon: '🍷' },
  { value: 'charity', label: 'Charity', icon: '❤️' },
  { value: 'launch', label: 'Product Launch', icon: '🚀' }
]

const suggestedCoHosts = [
  { id: '1', name: 'Sarah Kim', avatar: '👩‍💼', role: 'Product @ Stripe', reason: 'Co-hosted 2 masterminds' },
  { id: '2', name: 'Marcus Chen', avatar: '👨‍💻', role: 'Climate Founder', reason: '3 coffee chats together' },
  { id: '3', name: 'Jordan Rivera', avatar: '🎨', role: 'Creative Director', reason: 'Same mastermind group' }
]

export default function CreateEventPage() {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    date: '',
    time: '',
    location: '',
    type: '',
    description: '',
    visibility: 'connections',
    guestList: []
  })
  const [showCoHostSuggestions, setShowCoHostSuggestions] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateFormData = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addGuest = (guest: any) => {
    if (!formData.guestList.find(g => g.id === guest.id)) {
      updateFormData('guestList', [...formData.guestList, guest])
    }
  }

  const removeGuest = (guestId: string) => {
    updateFormData('guestList', formData.guestList.filter(g => g.id !== guestId))
  }

  const toggleCoHost = (guestId: string) => {
    updateFormData('guestList', formData.guestList.map(guest => 
      guest.id === guestId ? { ...guest, isCoHost: !guest.isCoHost } : guest
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Redirect to event page or show success
      console.log('Event created:', formData)
    } catch (error) {
      console.error('Failed to create event:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = formData.title && formData.date && formData.time && formData.type

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-purple-950/10 to-black text-white relative overflow-hidden">
      <HiveHexGrid />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-yellow-400 text-transparent bg-clip-text mb-4">
            Host an Event
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Bring your network to life. Host curated, intentional gatherings.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Event Details */}
          <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-purple-400 mb-6">Event Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  placeholder="e.g., Climate Tech Founders Dinner"
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
                  required
                />
              </div>

              {/* Date & Time */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => updateFormData('date', e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Time *
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => updateFormData('time', e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  required
                />
              </div>

              {/* Location */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                  placeholder="Venue name or 'Virtual' for online events"
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
                />
              </div>

              {/* Event Type */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Event Type *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {eventTypes.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => updateFormData('type', type.value)}
                      className={`p-3 rounded-lg text-center transition ${
                        formData.type === type.value
                          ? 'bg-purple-600 text-white border border-purple-400'
                          : 'bg-zinc-800 text-gray-400 border border-zinc-700 hover:border-purple-500'
                      }`}
                    >
                      <div className="text-xl mb-1">{type.icon}</div>
                      <div className="text-xs font-medium">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="What can attendees expect? Keep it concise and compelling..."
                  rows={3}
                  maxLength={300}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 resize-none"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {formData.description.length}/300 characters
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Visibility */}
          <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-purple-400 mb-4">Privacy Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <input
                  type="radio"
                  id="connections"
                  name="visibility"
                  value="connections"
                  checked={formData.visibility === 'connections'}
                  onChange={(e) => updateFormData('visibility', e.target.value)}
                  className="w-4 h-4 text-purple-600 bg-zinc-800 border-zinc-600"
                />
                <label htmlFor="connections" className="text-white">
                  <div className="font-medium">Only my connections</div>
                  <div className="text-sm text-gray-400">Only people you've verified can attend</div>
                </label>
              </div>
              
              <div className="flex items-center space-x-4">
                <input
                  type="radio"
                  id="open_invite"
                  name="visibility"
                  value="open_invite"
                  checked={formData.visibility === 'open_invite'}
                  onChange={(e) => updateFormData('visibility', e.target.value)}
                  className="w-4 h-4 text-purple-600 bg-zinc-800 border-zinc-600"
                />
                <label htmlFor="open_invite" className="text-white">
                  <div className="font-medium">Open to invite by my connections</div>
                  <div className="text-sm text-gray-400">Your connections can invite their verified contacts</div>
                </label>
              </div>
            </div>

            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-400">
                💡 Tip: Invite only those you've connected with directly — no strangers.
              </p>
            </div>
          </div>

          {/* Co-Host Suggestions */}
          <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-purple-400">Suggested Co-Hosts</h2>
              <button
                type="button"
                onClick={() => setShowCoHostSuggestions(!showCoHostSuggestions)}
                className="text-sm text-gray-400 hover:text-white transition"
              >
                {showCoHostSuggestions ? 'Hide' : 'Show'} Suggestions
              </button>
            </div>

            {showCoHostSuggestions && (
              <div className="space-y-3">
                {suggestedCoHosts.map(person => (
                  <div key={person.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{person.avatar}</span>
                      <div>
                        <div className="font-medium text-white">{person.name}</div>
                        <div className="text-sm text-gray-400">{person.role}</div>
                        <div className="text-xs text-purple-400">{person.reason}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => addGuest({ ...person, isCoHost: true })}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition text-sm"
                    >
                      Add as Co-Host
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Guest List */}
          <EventGuestList
            guests={formData.guestList}
            onRemoveGuest={removeGuest}
            onToggleCoHost={toggleCoHost}
            onAddGuest={addGuest}
          />

          {/* Submit */}
          <div className="flex space-x-4">
            <button
              type="button"
              className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
                isFormValid && !isSubmitting
                  ? 'bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600 text-white'
                  : 'bg-zinc-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Creating Event...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
