'use client'
import { useState } from 'react'
import HiveHexGrid from '@/components/HiveHexGrid'
import MastermindCard from '@/components/mastermind/MastermindCard'
import CreateMastermindForm from '@/components/mastermind/CreateMastermindForm'

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

const mockGroups: MastermindGroup[] = [
  {
    id: '1',
    name: 'Scaling SaaS from $10k to $100k MRR',
    goal: 'Help each other break through the $100k MRR milestone with proven strategies',
    tags: ['B2B SaaS', 'Funding', 'GTM'],
    members: [
      { id: '1', name: 'Sarah Kim', avatar: '👩‍💼', role: 'Product @ Stripe' },
      { id: '2', name: 'Marcus Chen', avatar: '👨‍💻', role: 'Founder @ ClimateOS' },
      { id: '3', name: 'Jordan Rivera', avatar: '🎨', role: 'Creative Director' }
    ],
    maxMembers: 5,
    cadence: 'Biweekly',
    nextSession: {
      date: '2024-01-15',
      time: '2:00 PM PST'
    },
    status: 'active',
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    name: 'Climate Tech Founders Circle',
    goal: 'Navigate the unique challenges of building climate solutions',
    tags: ['Climate Tech', 'Impact', 'Fundraising'],
    members: [
      { id: '4', name: 'Aisha Patel', avatar: '🧘‍♀️', role: 'Wellness Entrepreneur' },
      { id: '5', name: 'David Park', avatar: '🌱', role: 'Climate Investor' }
    ],
    maxMembers: 4,
    cadence: 'Monthly',
    nextSession: {
      date: '2024-01-20',
      time: '10:00 AM PST'
    },
    status: 'active',
    createdAt: '2023-12-15'
  },
  {
    id: '3',
    name: 'Women in Web3 Leadership',
    goal: 'Support women leaders navigating the Web3 ecosystem',
    tags: ['Web3', 'Leadership', 'Diversity'],
    members: [
      { id: '6', name: 'Elena Rodriguez', avatar: '👩‍🚀', role: 'Web3 Founder' }
    ],
    maxMembers: 6,
    cadence: 'Weekly',
    nextSession: null,
    status: 'upcoming',
    createdAt: '2024-01-10'
  }
]

export default function MastermindPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'past'>('active')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [groups] = useState<MastermindGroup[]>(mockGroups)

  const filteredGroups = groups.filter(group => group.status === activeTab)

  const getTabCount = (status: string) => {
    return groups.filter(group => group.status === status).length
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-purple-950/10 to-black text-white relative overflow-hidden">
      <HiveHexGrid />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-yellow-400 text-transparent bg-clip-text mb-4">
            Join a Mastermind Group
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
            Focused peer groups to help you scale smarter. Connect with like-minded founders 
            and professionals for structured, goal-oriented growth sessions.
          </p>
          
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Create a Mastermind
          </button>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-1 backdrop-blur-sm">
            {[
              { key: 'active', label: 'Active' },
              { key: 'upcoming', label: 'Upcoming' },
              { key: 'past', label: 'Past' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                {tab.label}
                <span className="ml-2 px-2 py-1 bg-zinc-700 rounded-full text-xs">
                  {getTabCount(tab.key)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Groups Grid */}
        {filteredGroups.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🧬</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {activeTab === 'active' && 'No Active Groups'}
              {activeTab === 'upcoming' && 'No Upcoming Groups'}
              {activeTab === 'past' && 'No Past Groups'}
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              {activeTab === 'active' && 'Join or create a mastermind group to start collaborating with peers.'}
              {activeTab === 'upcoming' && 'Groups you\'ve been invited to will appear here.'}
              {activeTab === 'past' && 'Completed mastermind groups will be archived here.'}
            </p>
            {activeTab === 'active' && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg transition"
              >
                Create Your First Group
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <MastermindCard key={group.id} group={group} />
            ))}
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm text-center">
            <div className="text-2xl font-bold text-purple-400 mb-2">
              {groups.filter(g => g.status === 'active').length}
            </div>
            <div className="text-gray-400">Active Groups</div>
          </div>
          
          <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-2">
              {groups.reduce((total, group) => total + group.members.length, 0)}
            </div>
            <div className="text-gray-400">Total Connections</div>
          </div>
          
          <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm text-center">
            <div className="text-2xl font-bold text-green-400 mb-2">
              {groups.filter(g => g.nextSession).length}
            </div>
            <div className="text-gray-400">Upcoming Sessions</div>
          </div>
        </div>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <CreateMastermindForm onClose={() => setShowCreateForm(false)} />
      )}
    </main>
  )
}
