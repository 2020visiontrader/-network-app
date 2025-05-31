'use client'
import { useState, useEffect } from 'react'
import HiveHexGrid from '@/components/HiveHexGrid'
import AmbassadorForm from '@/components/ambassador/AmbassadorForm'
import ReferralTracker from '@/components/ambassador/ReferralTracker'
import BadgeIcon from '@/components/ambassador/BadgeIcon'

interface UserStats {
  coffeeChats: number
  mastermindJoins: number
  networkConnections: number
  isEligible: boolean
  isAmbassador: boolean
  applicationStatus: 'none' | 'pending' | 'approved' | 'denied'
}

interface ReferralData {
  id: string
  name: string
  email: string
  status: 'invited' | 'joined' | 'approved' | 'denied'
  invitedAt: string
  approvedAt?: string
}

const mockUserStats: UserStats = {
  coffeeChats: 7,
  mastermindJoins: 3,
  networkConnections: 24,
  isEligible: true,
  isAmbassador: false,
  applicationStatus: 'none'
}

const mockReferrals: ReferralData[] = [
  {
    id: '1',
    name: 'Alex Chen',
    email: 'alex@startup.com',
    status: 'approved',
    invitedAt: '2024-01-01',
    approvedAt: '2024-01-05'
  },
  {
    id: '2',
    name: 'Sarah Kim',
    email: 'sarah@company.com',
    status: 'joined',
    invitedAt: '2024-01-10'
  },
  {
    id: '3',
    name: 'Marcus Rivera',
    email: 'marcus@venture.com',
    status: 'invited',
    invitedAt: '2024-01-15'
  }
]

export default function AmbassadorPage() {
  const [userStats, setUserStats] = useState<UserStats>(mockUserStats)
  const [referrals, setReferrals] = useState<ReferralData[]>(mockReferrals)
  const [showApplicationForm, setShowApplicationForm] = useState(false)

  const approvedReferrals = referrals.filter(r => r.status === 'approved').length
  const hasAmbassadorBadge = approvedReferrals >= 3

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-purple-950/10 to-black text-white relative overflow-hidden">
      <HiveHexGrid />
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-purple-400 text-transparent bg-clip-text">
              Ambassador Program
            </h1>
            {userStats.isAmbassador && <BadgeIcon />}
          </div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Grow the Network through trusted referrals and unlock exclusive perks
          </p>
        </div>

        {/* Eligibility Card */}
        {userStats.isEligible && userStats.applicationStatus === 'none' && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-yellow-900/30 to-purple-900/30 border-2 border-yellow-500/50 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden">
              {/* Pulsing border effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-purple-500/20 rounded-2xl animate-pulse" />
              
              <div className="relative text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌟</span>
                </div>
                <h2 className="text-2xl font-bold text-yellow-400 mb-2">
                  You've Been Selected to Grow the Hive
                </h2>
                <p className="text-gray-300 mb-6 max-w-xl mx-auto">
                  Your engagement qualifies you for our Ambassador program. Help us build a stronger network 
                  and unlock exclusive perks.
                </p>
                
                {/* Stats that qualified them */}
                <div className="flex justify-center space-x-8 mb-6 text-sm">
                  <div className="text-center">
                    <div className="text-xl font-bold text-yellow-400">{userStats.coffeeChats}</div>
                    <div className="text-gray-400">Coffee Chats</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-400">{userStats.mastermindJoins}</div>
                    <div className="text-gray-400">Mastermind Groups</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-400">{userStats.networkConnections}</div>
                    <div className="text-gray-400">Connections</div>
                  </div>
                </div>

                <button
                  onClick={() => setShowApplicationForm(true)}
                  className="bg-gradient-to-r from-yellow-500 to-purple-500 hover:from-yellow-600 hover:to-purple-600 text-black font-bold px-8 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Apply to Become an Ambassador
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Application Status */}
        {userStats.applicationStatus === 'pending' && (
          <div className="mb-8 bg-blue-900/30 border border-blue-500/50 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-blue-400 mb-2">Application Under Review</h3>
            <p className="text-gray-300">We'll notify you within 72 hours about your ambassador application.</p>
          </div>
        )}

        {userStats.applicationStatus === 'approved' && (
          <div className="mb-8 bg-green-900/30 border border-green-500/50 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-green-400 mb-2">Welcome, Ambassador! 🎉</h3>
            <p className="text-gray-300">You can now invite up to 10 people and access exclusive perks.</p>
          </div>
        )}

        {/* Ambassador Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
              <span className="text-xl">🎯</span>
            </div>
            <h3 className="font-semibold text-white mb-2">Exclusive Access</h3>
            <p className="text-sm text-gray-400">Early feature previews and beta testing opportunities</p>
          </div>
          
          <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mb-4">
              <span className="text-xl">🎪</span>
            </div>
            <h3 className="font-semibold text-white mb-2">IRL Events</h3>
            <p className="text-sm text-gray-400">Invitations to exclusive ambassador meetups and retreats</p>
          </div>
          
          <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
              <span className="text-xl">⭐</span>
            </div>
            <h3 className="font-semibold text-white mb-2">Premium Perks</h3>
            <p className="text-sm text-gray-400">Enhanced profile visibility and priority matching</p>
          </div>
        </div>

        {/* Referral Tracker */}
        {(userStats.isAmbassador || userStats.applicationStatus === 'approved') && (
          <ReferralTracker 
            referrals={referrals} 
            approvedCount={approvedReferrals}
            hasAmbassadorBadge={hasAmbassadorBadge}
          />
        )}

        {/* Badge Achievement */}
        {hasAmbassadorBadge && (
          <div className="mt-8 bg-gradient-to-r from-purple-900/30 to-yellow-900/30 border border-purple-500/50 rounded-2xl p-6 text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <BadgeIcon size="large" />
              <h3 className="text-xl font-bold text-purple-400">Hive Ambassador Badge Unlocked!</h3>
            </div>
            <p className="text-gray-300">
              You've successfully referred 3+ approved members. Your badge is now visible on your profile.
            </p>
          </div>
        )}
      </div>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <AmbassadorForm 
          onClose={() => setShowApplicationForm(false)}
          onSubmit={(data) => {
            setUserStats(prev => ({ ...prev, applicationStatus: 'pending' }))
            setShowApplicationForm(false)
          }}
        />
      )}
    </main>
  )
}
