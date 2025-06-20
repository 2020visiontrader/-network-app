'use client'
import { useState } from 'react'

interface Contact {
  id: string
  name: string
  tagline: string
  niche: string
  city: string
  avatar: string
  availability: 'available' | 'busy' | 'away'
  lastActive: string
}

const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Sarah Kim',
    tagline: 'Product @ Stripe, fintech in emerging markets',
    niche: 'Fintech',
    city: 'San Francisco',
    avatar: '👩‍💼',
    availability: 'available',
    lastActive: '2 hours ago'
  },
  {
    id: '2',
    name: 'Marcus Chen',
    tagline: 'Building climate solutions for Southeast Asia',
    niche: 'Climate Tech',
    city: 'San Francisco',
    avatar: '👨‍💻',
    availability: 'available',
    lastActive: '1 day ago'
  },
  {
    id: '3',
    name: 'Aisha Patel',
    tagline: 'Wellness entrepreneur, mindful productivity',
    niche: 'Wellness',
    city: 'San Francisco',
    avatar: '🧘‍♀️',
    availability: 'busy',
    lastActive: '3 hours ago'
  },
  {
    id: '4',
    name: 'Jordan Rivera',
    tagline: 'Creative director, brand storytelling',
    niche: 'Creative',
    city: 'San Francisco',
    avatar: '🎨',
    availability: 'available',
    lastActive: '5 hours ago'
  }
]

const niches = ['All Niches', 'Fintech', 'Climate Tech', 'Wellness', 'Creative', 'Web3', 'AI']
const cities = ['San Francisco', 'New York', 'Los Angeles', 'Austin', 'Miami']

interface ContactSelectorProps {
  selectedContact: Contact | null
  onContactSelect: (contact: Contact) => void
}

export default function ContactSelector({ selectedContact, onContactSelect }: ContactSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNiche, setSelectedNiche] = useState('All Niches')
  const [selectedCity, setSelectedCity] = useState('San Francisco')
  const [showAvailableOnly, setShowAvailableOnly] = useState(true)

  const filteredContacts = mockContacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.tagline.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesNiche = selectedNiche === 'All Niches' || contact.niche === selectedNiche
    const matchesCity = contact.city === selectedCity
    const matchesAvailability = !showAvailableOnly || contact.availability === 'available'
    
    return matchesSearch && matchesNiche && matchesCity && matchesAvailability
  })

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'text-green-400'
      case 'busy': return 'text-yellow-400'
      case 'away': return 'text-gray-400'
      default: return 'text-gray-400'
    }
  }

  const getAvailabilityIcon = (availability: string) => {
    switch (availability) {
      case 'available': return '🟢'
      case 'busy': return '🟡'
      case 'away': return '⚫'
      default: return '⚫'
    }
  }

  return (
    <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-amber-400 mb-6 flex items-center space-x-2">
        <span>👥</span>
        <span>Who would you like to meet?</span>
      </h3>

      {/* Search & Filters */}
      <div className="space-y-4 mb-6">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search or filter by niche/location..."
            className="w-full px-4 py-3 pl-10 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white placeholder-gray-500"
          />
          <svg className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={selectedNiche}
            onChange={(e) => setSelectedNiche(e.target.value)}
            className="px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white text-sm"
          >
            {niches.map(niche => (
              <option key={niche} value={niche}>{niche}</option>
            ))}
          </select>
          
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white text-sm"
          >
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Available Only Toggle */}
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={showAvailableOnly}
            onChange={(e) => setShowAvailableOnly(e.target.checked)}
            className="w-4 h-4 text-amber-500 bg-zinc-800 border-zinc-600 rounded focus:ring-amber-500"
          />
          <span className="text-sm text-gray-300">Show only available members</span>
        </label>
      </div>

      {/* Contact List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredContacts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No contacts found matching your criteria</p>
            <p className="text-sm mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          filteredContacts.map(contact => (
            <div
              key={contact.id}
              onClick={() => onContactSelect(contact)}
              className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                selectedContact?.id === contact.id
                  ? 'bg-amber-500/20 border-amber-500/50 shadow-lg'
                  : 'bg-zinc-800/50 border-zinc-700 hover:border-amber-500/50 hover:bg-zinc-800/70'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="text-2xl">{contact.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-white truncate">{contact.name}</h4>
                    <div className="flex items-center space-x-1 text-xs">
                      <span>{getAvailabilityIcon(contact.availability)}</span>
                      <span className={getAvailabilityColor(contact.availability)}>
                        {contact.availability}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mb-2 line-clamp-2">{contact.tagline}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="bg-zinc-700 px-2 py-1 rounded">{contact.niche}</span>
                    <span>Active {contact.lastActive}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Selected Contact Summary */}
      {selectedContact && (
        <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-xl">{selectedContact.avatar}</span>
            <div>
              <h4 className="font-semibold text-amber-400">Selected: {selectedContact.name}</h4>
              <p className="text-sm text-gray-300">{selectedContact.tagline}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
