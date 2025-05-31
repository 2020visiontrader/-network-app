'use client'

interface ReferralData {
  id: string
  name: string
  email: string
  status: 'invited' | 'joined' | 'approved' | 'denied'
  invitedAt: string
  approvedAt?: string
}

interface ReferralTrackerProps {
  referrals: ReferralData[]
  approvedCount: number
  hasAmbassadorBadge: boolean
}

export default function ReferralTracker({ referrals, approvedCount, hasAmbassadorBadge }: ReferralTrackerProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'invited': return 'text-gray-400 bg-gray-500/20'
      case 'joined': return 'text-yellow-400 bg-yellow-500/20'
      case 'approved': return 'text-green-400 bg-green-500/20'
      case 'denied': return 'text-red-400 bg-red-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'invited': return '📧'
      case 'joined': return '🟡'
      case 'approved': return '🟢'
      case 'denied': return '🔴'
      default: return '⚫'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'invited': return 'Invite Sent'
      case 'joined': return 'Joined'
      case 'approved': return 'Approved'
      case 'denied': return 'Denied'
      default: return 'Unknown'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const invitedCount = referrals.filter(r => r.status === 'invited').length
  const joinedCount = referrals.filter(r => r.status === 'joined').length
  const deniedCount = referrals.filter(r => r.status === 'denied').length

  return (
    <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-purple-400 flex items-center space-x-2">
          <span>📊</span>
          <span>Referral Dashboard</span>
        </h2>
        <button className="text-sm text-gray-400 hover:text-white transition">
          Send New Invite
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-800/50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-400">{referrals.length}</div>
          <div className="text-xs text-gray-400">Total Invited</div>
        </div>
        
        <div className="bg-zinc-800/50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-400">{joinedCount}</div>
          <div className="text-xs text-gray-400">Joined</div>
        </div>
        
        <div className="bg-zinc-800/50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-400">{approvedCount}</div>
          <div className="text-xs text-gray-400">Approved</div>
        </div>
        
        <div className="bg-zinc-800/50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-400">
            {referrals.length > 0 ? Math.round((approvedCount / referrals.length) * 100) : 0}%
          </div>
          <div className="text-xs text-gray-400">Success Rate</div>
        </div>
      </div>

      {/* Progress to Badge */}
      {!hasAmbassadorBadge && (
        <div className="mb-6 p-4 bg-purple-900/30 border border-purple-500/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-400">Progress to Ambassador Badge</span>
            <span className="text-sm text-gray-400">{approvedCount}/3 approved</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-yellow-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((approvedCount / 3) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {3 - approvedCount > 0 
              ? `${3 - approvedCount} more approved referrals needed for your badge`
              : 'Badge unlocked! 🎉'
            }
          </p>
        </div>
      )}

      {/* Referrals List */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-300 mb-4">Your Referrals</h3>
        
        {referrals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <p className="mb-2">You haven't invited anyone yet</p>
            <p className="text-sm">Start growing the Network with your first referral</p>
          </div>
        ) : (
          referrals.map((referral) => (
            <div
              key={referral.id}
              className="flex items-center justify-between p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg hover:border-zinc-600 transition"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">
                    {referral.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-white">{referral.name}</div>
                  <div className="text-sm text-gray-400">{referral.email}</div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(referral.status)}`}>
                    <span>{getStatusIcon(referral.status)}</span>
                    <span>{getStatusLabel(referral.status)}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Invited {formatDate(referral.invitedAt)}
                  </div>
                  {referral.approvedAt && (
                    <div className="text-xs text-green-400">
                      Approved {formatDate(referral.approvedAt)}
                    </div>
                  )}
                </div>

                {referral.status === 'invited' && (
                  <button className="text-xs text-blue-400 hover:text-blue-300 transition">
                    Resend
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-6 border-t border-zinc-700 flex space-x-4">
        <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-lg transition">
          Send New Invite
        </button>
        <button className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-gray-300 rounded-lg transition">
          View Analytics
        </button>
      </div>
    </div>
  )
}
