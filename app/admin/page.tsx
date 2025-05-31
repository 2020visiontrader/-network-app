'use client'
import { useState, useEffect } from 'react'
import HiveHexGrid from '@/components/HiveHexGrid'
import WaitlistManager from '@/components/admin/WaitlistManager'
import UserCapManager from '@/components/admin/UserCapManager'
import SystemBroadcast from '@/components/admin/SystemBroadcast'
import UserAnalytics from '@/components/admin/UserAnalytics'

interface AdminUser {
  id: string
  email: string
  role: 'admin' | 'super_admin'
}

interface WaitlistUser {
  id: string
  name: string
  email: string
  linkedinUrl?: string
  reason?: string
  appliedAt: string
  status: 'pending' | 'approved' | 'declined'
  referredBy?: string
}

const mockWaitlistUsers: WaitlistUser[] = [
  {
    id: '1',
    name: 'Alex Chen',
    email: 'alex@startup.com',
    linkedinUrl: 'linkedin.com/in/alexchen',
    reason: 'Building AI-powered climate solutions, looking to connect with impact investors',
    appliedAt: '2024-01-15T10:30:00Z',
    status: 'pending',
    referredBy: 'Sarah Kim'
  },
  {
    id: '2',
    name: 'Maria Rodriguez',
    email: 'maria@healthtech.co',
    linkedinUrl: 'linkedin.com/in/mariarodriguez',
    reason: 'HealthTech founder seeking co-founder and early customers',
    appliedAt: '2024-01-14T16:45:00Z',
    status: 'pending'
  },
  {
    id: '3',
    name: 'David Park',
    email: 'david@venture.fund',
    reason: 'Early-stage investor focused on Web3 and climate tech',
    appliedAt: '2024-01-13T09:15:00Z',
    status: 'pending',
    referredBy: 'Marcus Chen'
  }
]

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null)
  const [waitlistUsers, setWaitlistUsers] = useState<WaitlistUser[]>(mockWaitlistUsers)
  const [activeTab, setActiveTab] = useState<'waitlist' | 'users' | 'system' | 'analytics'>('waitlist')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check admin authentication
    const checkAdminAuth = async () => {
      try {
        // Simulate auth check
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock admin user - in real app, this would come from auth
        setCurrentUser({
          id: 'admin1',
          email: 'admin@network.app',
          role: 'super_admin'
        })
      } catch (error) {
        console.error('Admin auth failed:', error)
        // Redirect to login
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminAuth()
  }, [])

  const handleWaitlistAction = async (userId: string, action: 'approve' | 'decline') => {
    setWaitlistUsers(prev => 
      prev.map(user => 
        user.id === userId 
          ? { ...user, status: action === 'approve' ? 'approved' : 'declined' }
          : user
      )
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-gray-400">You don't have admin privileges</p>
        </div>
      </div>
    )
  }

  const pendingCount = waitlistUsers.filter(u => u.status === 'pending').length
  const approvedCount = waitlistUsers.filter(u => u.status === 'approved').length
  const declinedCount = waitlistUsers.filter(u => u.status === 'declined').length

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-red-950/10 to-black text-white relative overflow-hidden">
      <HiveHexGrid />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 text-transparent bg-clip-text mb-2">
              Admin Command Center
            </h1>
            <p className="text-gray-300">Network management and system controls</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">Logged in as</div>
              <div className="font-medium text-white">{currentUser.email}</div>
              <div className="text-xs text-red-400">{currentUser.role.replace('_', ' ').toUpperCase()}</div>
            </div>
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-lg">👑</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-zinc-900/70 border border-zinc-800 rounded-xl p-1 backdrop-blur-sm">
          {[
            { key: 'waitlist', label: 'Waitlist', count: pendingCount },
            { key: 'users', label: 'User Cap', count: null },
            { key: 'system', label: 'System', count: null },
            { key: 'analytics', label: 'Analytics', count: null }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className="ml-2 px-2 py-1 bg-zinc-700 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'waitlist' && (
          <WaitlistManager
            users={waitlistUsers}
            onAction={handleWaitlistAction}
            stats={{ pending: pendingCount, approved: approvedCount, declined: declinedCount }}
          />
        )}

        {activeTab === 'users' && (
          <UserCapManager />
        )}

        {activeTab === 'system' && (
          <SystemBroadcast />
        )}

        {activeTab === 'analytics' && (
          <UserAnalytics />
        )}

        {/* Quick Stats */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-2">{pendingCount}</div>
            <div className="text-gray-400 text-sm">Pending Applications</div>
          </div>
          
          <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm text-center">
            <div className="text-2xl font-bold text-green-400 mb-2">{approvedCount}</div>
            <div className="text-gray-400 text-sm">Approved Today</div>
          </div>
          
          <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm text-center">
            <div className="text-2xl font-bold text-red-400 mb-2">{declinedCount}</div>
            <div className="text-gray-400 text-sm">Declined</div>
          </div>
          
          <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm text-center">
            <div className="text-2xl font-bold text-purple-400 mb-2">247</div>
            <div className="text-gray-400 text-sm">Active Members</div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-6 bg-green-900/30 border border-green-500/50 p-4 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 font-medium">All Systems Operational</span>
            <span className="text-gray-400 text-sm">Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </main>
  )
}
