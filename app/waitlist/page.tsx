'use client'
import { useState, useEffect } from 'react'
import HiveHexGrid from '@/components/HiveHexGrid'
interface User {
  id: string
  name: string
  email: string
  status: 'active' | 'pending' | 'waitlisted' | 'suspended'
  profile_progress: number
  is_ambassador: boolean
  created_at: string
}

interface WaitlistStatus {
  position: number
  totalWaitlisted: number
  estimatedWaitTime: string
  referralCode: string
  referralsCount: number
  priorityStatus: boolean
}

export default function WaitlistPage() {
  const [user, setUser] = useState<User | null>(null)
  const [waitlistStatus, setWaitlistStatus] = useState<WaitlistStatus | null>(null)
  const [referralEmail, setReferralEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Mock user data - in real app, get from auth context
    setUser({
      id: 'user-1',
      name: 'Alex Chen',
      email: 'alex@example.com',
      status: 'waitlisted',
      profile_progress: 60,
      is_ambassador: false,
      created_at: new Date().toISOString()
    })

    // Mock waitlist status
    setWaitlistStatus({
      position: 47,
      totalWaitlisted: 156,
      estimatedWaitTime: '2-3 weeks',
      referralCode: 'ALEX2024',
      referralsCount: 2,
      priorityStatus: false
    })
  }, [])

  const handleReferralSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!referralEmail.trim()) return

    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMessage('Referral sent! They\'ll receive an invitation to join the waitlist.')
      setReferralEmail('')
    } catch (error) {
      setMessage('Failed to send referral. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user || !waitlistStatus) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-black via-amber-950/10 to-black text-white relative overflow-hidden">
        <HiveHexGrid />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-amber-950/10 to-black text-white relative overflow-hidden">
      <HiveHexGrid />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">⏳</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 text-transparent bg-clip-text mb-4">
            You're on the Waitlist
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            We've reached our member cap for this season. You'll be notified once space opens up.
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-8 mb-8 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400 mb-2">#{waitlistStatus.position}</div>
              <div className="text-gray-400">Your Position</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400 mb-2">{waitlistStatus.totalWaitlisted}</div>
              <div className="text-gray-400">Total Waitlisted</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">{waitlistStatus.estimatedWaitTime}</div>
              <div className="text-gray-400">Estimated Wait</div>
            </div>
          </div>

          {waitlistStatus.priorityStatus && (
            <div className="mt-6 p-4 bg-amber-500/20 border border-amber-500/30 rounded-xl">
              <div className="flex items-center space-x-2">
                <span className="text-amber-400">⭐</span>
                <span className="text-amber-300 font-medium">Priority Status Active</span>
              </div>
              <p className="text-amber-200 text-sm mt-1">
                You were referred by an existing member and have priority access.
              </p>
            </div>
          )}
        </div>

        {/* Referral Section */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-8 mb-8 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-4">Move Up Faster</h2>
          <p className="text-gray-300 mb-6">
            Refer other professionals to join the waitlist. Each successful referral moves you up in the queue.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Referral Code */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Referral Code
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 p-3 bg-zinc-800 border border-zinc-700 rounded-lg font-mono text-amber-400">
                  {waitlistStatus.referralCode}
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(waitlistStatus.referralCode)}
                  className="px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition"
                >
                  Copy
                </button>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                Share this code with professionals you'd like to invite.
              </p>
            </div>

            {/* Send Referral */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Send Direct Invitation
              </label>
              <form onSubmit={handleReferralSubmit} className="space-y-3">
                <input
                  type="email"
                  value={referralEmail}
                  onChange={(e) => setReferralEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-medium rounded-lg transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Send Invitation'}
                </button>
              </form>
              {message && (
                <p className="text-sm text-amber-400 mt-2">{message}</p>
              )}
            </div>
          </div>

          {/* Referral Stats */}
          <div className="mt-6 p-4 bg-zinc-800/50 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Successful Referrals</span>
              <span className="text-amber-400 font-bold">{waitlistStatus.referralsCount}</span>
            </div>
            <div className="w-full bg-zinc-700 rounded-full h-2 mt-2">
              <div
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((waitlistStatus.referralsCount / 5) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Refer 5 people to unlock priority status
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-8 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-amber-400 mb-2">
                How do membership slots open up?
              </h3>
              <p className="text-gray-300">
                We maintain a 250-member cap to ensure quality connections. Slots open when members become inactive or when we expand capacity based on platform growth.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-amber-400 mb-2">
                What happens when I'm accepted?
              </h3>
              <p className="text-gray-300">
                You'll receive an email invitation with access to complete your profile and join the Network. You'll have 48 hours to activate your account.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-amber-400 mb-2">
                Can I update my application?
              </h3>
              <p className="text-gray-300">
                Your application is locked, but you can continue referring others to improve your position. Quality referrals demonstrate your network value.
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="text-center mt-12">
          <p className="text-gray-400">
            Questions about your waitlist status?{' '}
            <a href="mailto:support@network.app" className="text-amber-400 hover:text-amber-300 transition">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
