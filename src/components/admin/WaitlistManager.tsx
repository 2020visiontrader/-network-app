'use client'
import { useState } from 'react'

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

interface WaitlistManagerProps {
  users: WaitlistUser[]
  onAction: (userId: string, action: 'approve' | 'decline') => void
  stats: {
    pending: number
    approved: number
    declined: number
  }
}

export default function WaitlistManager({ users, onAction, stats }: WaitlistManagerProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'declined'>('pending')
  const [selectedUser, setSelectedUser] = useState<WaitlistUser | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const filteredUsers = users.filter(user => 
    filter === 'all' || user.status === filter
  )

  const handleAction = async (userId: string, action: 'approve' | 'decline') => {
    setActionLoading(userId)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      onAction(userId, action)
    } finally {
      setActionLoading(null)
      setSelectedUser(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-500/20'
      case 'approved': return 'text-green-400 bg-green-500/20'
      case 'declined': return 'text-red-400 bg-red-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Waitlist Management</h2>
        
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Applications ({users.length})</option>
            <option value="pending">Pending ({stats.pending})</option>
            <option value="approved">Approved ({stats.approved})</option>
            <option value="declined">Declined ({stats.declined})</option>
          </select>
        </div>
      </div>

      {/* Waitlist Table */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl backdrop-blur-sm overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <p>No {filter === 'all' ? '' : filter} applications at the moment</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800/50 border-b border-zinc-700">
                <tr>
                  <th className="text-left p-4 text-gray-300 font-medium">Applicant</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Application</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Referral</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-zinc-800 hover:bg-zinc-800/30 transition">
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-white">{user.name}</div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                        {user.linkedinUrl && (
                          <a 
                            href={`https://${user.linkedinUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:text-blue-300 transition"
                          >
                            LinkedIn Profile
                          </a>
                        )}
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="text-sm text-gray-300 max-w-xs">
                        {user.reason ? (
                          <div>
                            <p className="line-clamp-2">{user.reason}</p>
                            {user.reason.length > 100 && (
                              <button
                                onClick={() => setSelectedUser(user)}
                                className="text-purple-400 hover:text-purple-300 text-xs mt-1"
                              >
                                Read more
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500 italic">No reason provided</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Applied {formatDate(user.appliedAt)}
                      </div>
                    </td>
                    
                    <td className="p-4">
                      {user.referredBy ? (
                        <div className="text-sm">
                          <div className="text-purple-400">Referred by</div>
                          <div className="text-white">{user.referredBy}</div>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">Direct application</span>
                      )}
                    </td>
                    
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    
                    <td className="p-4">
                      {user.status === 'pending' ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAction(user.id, 'approve')}
                            disabled={actionLoading === user.id}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition disabled:opacity-50"
                          >
                            {actionLoading === user.id ? '...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleAction(user.id, 'decline')}
                            disabled={actionLoading === user.id}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition disabled:opacity-50"
                          >
                            {actionLoading === user.id ? '...' : 'Decline'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">
                          {user.status === 'approved' ? 'Approved' : 'Declined'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Application Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Application Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 bg-zinc-800 hover:bg-zinc-700 rounded-full flex items-center justify-center transition"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-white mb-2">Applicant Information</h4>
                <div className="bg-zinc-800/50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-400">Name</div>
                      <div className="text-white">{selectedUser.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Email</div>
                      <div className="text-white">{selectedUser.email}</div>
                    </div>
                    {selectedUser.linkedinUrl && (
                      <div className="md:col-span-2">
                        <div className="text-sm text-gray-400">LinkedIn</div>
                        <a 
                          href={`https://${selectedUser.linkedinUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 transition"
                        >
                          {selectedUser.linkedinUrl}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedUser.reason && (
                <div>
                  <h4 className="font-medium text-white mb-2">Application Reason</h4>
                  <div className="bg-zinc-800/50 p-4 rounded-lg">
                    <p className="text-gray-300 leading-relaxed">{selectedUser.reason}</p>
                  </div>
                </div>
              )}

              {selectedUser.referredBy && (
                <div>
                  <h4 className="font-medium text-white mb-2">Referral</h4>
                  <div className="bg-purple-900/30 border border-purple-500/30 p-4 rounded-lg">
                    <p className="text-purple-300">Referred by {selectedUser.referredBy}</p>
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium text-white mb-2">Application Timeline</h4>
                <div className="bg-zinc-800/50 p-4 rounded-lg">
                  <div className="text-sm text-gray-400">Applied on</div>
                  <div className="text-white">{formatDate(selectedUser.appliedAt)}</div>
                </div>
              </div>
            </div>

            {selectedUser.status === 'pending' && (
              <div className="flex space-x-4 mt-6 pt-6 border-t border-zinc-700">
                <button
                  onClick={() => handleAction(selectedUser.id, 'decline')}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                >
                  Decline Application
                </button>
                <button
                  onClick={() => handleAction(selectedUser.id, 'approve')}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                >
                  Approve Application
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
