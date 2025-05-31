'use client'
import { useState } from 'react'
import HiveHexGrid from '@/components/HiveHexGrid'
import StatusUpdate from '@/components/status/StatusUpdate'
import StatusDisplay from '@/components/status/StatusDisplay'

interface StatusData {
  text: string
  intensity: 'casual' | 'semi-active' | 'urgent'
  expiresAt: string
  isActive: boolean
  updatedAt: string
}

const mockNetworkStatuses = [
  {
    id: '1',
    user: { name: 'Sarah Kim', avatar: '👩‍💼', role: 'Product @ Stripe' },
    status: {
      text: 'In Jakarta for Web3 Summit - looking for fintech founders',
      intensity: 'semi-active' as const,
      expiresAt: '2024-01-22T00:00:00Z',
      isActive: true,
      updatedAt: '2024-01-15T10:30:00Z'
    }
  },
  {
    id: '2',
    user: { name: 'Marcus Chen', avatar: '👨‍💻', role: 'Climate Founder' },
    status: {
      text: 'Fundraising Series A - open to investor intros',
      intensity: 'urgent' as const,
      expiresAt: '2024-01-20T00:00:00Z',
      isActive: true,
      updatedAt: '2024-01-15T08:15:00Z'
    }
  },
  {
    id: '3',
    user: { name: 'Jordan Rivera', avatar: '🎨', role: 'Creative Director' },
    status: {
      text: 'Available for coffee chats this week in SF',
      intensity: 'casual' as const,
      expiresAt: '2024-01-25T00:00:00Z',
      isActive: true,
      updatedAt: '2024-01-14T16:45:00Z'
    }
  }
]

export default function StatusPage() {
  const [userStatus, setUserStatus] = useState<StatusData | null>(null)
  const [networkStatuses] = useState(mockNetworkStatuses)

  const handleStatusUpdate = (status: StatusData) => {
    setUserStatus({
      ...status,
      updatedAt: new Date().toISOString()
    })
  }

  const handleStatusClear = () => {
    setUserStatus(null)
  }

  const getIntensityCount = (intensity: string) => {
    return networkStatuses.filter(item => item.status.intensity === intensity).length
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-purple-950/10 to-black text-white relative overflow-hidden">
      <HiveHexGrid />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-yellow-400 text-transparent bg-clip-text mb-4">
            Live Status & Availability
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Share what you're up to and see what's happening in your network
          </p>
        </div>

        {/* Your Status */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-4">Your Status</h2>
          <StatusUpdate
            currentStatus={userStatus}
            onStatusUpdate={handleStatusUpdate}
            onStatusClear={handleStatusClear}
          />
        </div>

        {/* Status Preview */}
        {userStatus && (
          <div className="mb-10">
            <h3 className="text-lg font-medium text-white mb-4">How others see your status:</h3>
            <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-xl">👤</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-white">Your Name</span>
                    <StatusDisplay 
                      status={userStatus} 
                      userName="You" 
                      size="medium"
                      showTooltip={true}
                    />
                  </div>
                  <div className="text-sm text-gray-400">Your Role</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Network Activity */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Network Activity</h2>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <span className="text-gray-400">{getIntensityCount('casual')} Casual</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-gray-400">{getIntensityCount('semi-active')} Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-gray-400">{getIntensityCount('urgent')} Urgent</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {networkStatuses.map((item) => (
              <div key={item.id} className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm hover:border-zinc-700 transition">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center">
                    <span className="text-xl">{item.user.avatar}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-medium text-white">{item.user.name}</span>
                      <StatusDisplay 
                        status={item.status} 
                        userName={item.user.name} 
                        size="medium"
                        showTooltip={true}
                      />
                    </div>
                    <div className="text-sm text-gray-400 mb-3">{item.user.role}</div>
                    <div className="text-white">{item.status.text}</div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition text-sm">
                      Connect
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {networkStatuses.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📡</span>
              </div>
              <p className="mb-2">No active statuses in your network</p>
              <p className="text-sm">Be the first to share what you're up to!</p>
            </div>
          )}
        </div>

        {/* Status Guidelines */}
        <div className="mt-10 bg-zinc-900/70 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm">
          <h3 className="font-medium text-white mb-4">Status Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <span className="font-medium text-yellow-400">Casual</span>
              </div>
              <p className="text-gray-400">General availability, networking opportunities, or low-priority updates</p>
            </div>
            
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="font-medium text-green-400">Semi-Active</span>
              </div>
              <p className="text-gray-400">Travel plans, events, or moderately important requests</p>
            </div>
            
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <span className="font-medium text-red-400">Urgent</span>
              </div>
              <p className="text-gray-400">Time-sensitive opportunities, fundraising, or critical needs</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
