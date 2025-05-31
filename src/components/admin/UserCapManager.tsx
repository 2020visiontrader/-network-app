'use client'
import { useState } from 'react'

interface UserCapData {
  currentCap: number
  activeMembersCount: number
  waitlistCount: number
  lastUpdated: string
  updatedBy: string
}

export default function UserCapManager() {
  const [capData, setCapData] = useState<UserCapData>({
    currentCap: 250,
    activeMembersCount: 247,
    waitlistCount: 23,
    lastUpdated: '2024-01-15T10:30:00Z',
    updatedBy: 'admin@network.app'
  })
  const [newCap, setNewCap] = useState(capData.currentCap)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleUpdateCap = async () => {
    if (newCap === capData.currentCap) return

    setIsUpdating(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setCapData(prev => ({
        ...prev,
        currentCap: newCap,
        lastUpdated: new Date().toISOString(),
        updatedBy: 'admin@network.app'
      }))
      
      setShowConfirmation(true)
      setTimeout(() => setShowConfirmation(false), 3000)
    } catch (error) {
      console.error('Failed to update cap:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCapacityPercentage = () => {
    return Math.round((capData.activeMembersCount / capData.currentCap) * 100)
  }

  const getRemainingSlots = () => {
    return capData.currentCap - capData.activeMembersCount
  }

  const getCapacityColor = () => {
    const percentage = getCapacityPercentage()
    if (percentage >= 95) return 'text-red-400 bg-red-500/20'
    if (percentage >= 85) return 'text-yellow-400 bg-yellow-500/20'
    return 'text-green-400 bg-green-500/20'
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">User Capacity Management</h2>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-white">Current Capacity</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCapacityColor()}`}>
              {getCapacityPercentage()}% Full
            </span>
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {capData.activeMembersCount} / {capData.currentCap}
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-purple-500 to-yellow-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getCapacityPercentage()}%` }}
            />
          </div>
          <div className="text-sm text-gray-400">
            {getRemainingSlots()} slots remaining
          </div>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm">
          <h3 className="font-medium text-white mb-4">Waitlist Queue</h3>
          <div className="text-3xl font-bold text-yellow-400 mb-2">
            {capData.waitlistCount}
          </div>
          <div className="text-sm text-gray-400">
            People waiting for approval
          </div>
          <div className="mt-4">
            <button className="text-sm text-purple-400 hover:text-purple-300 transition">
              View Waitlist →
            </button>
          </div>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm">
          <h3 className="font-medium text-white mb-4">Last Updated</h3>
          <div className="text-lg font-semibold text-white mb-1">
            {formatDate(capData.lastUpdated)}
          </div>
          <div className="text-sm text-gray-400">
            by {capData.updatedBy}
          </div>
        </div>
      </div>

      {/* Update Capacity */}
      <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm">
        <h3 className="font-medium text-white mb-6">Update Member Capacity</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              New Capacity Limit
            </label>
            <input
              type="number"
              value={newCap}
              onChange={(e) => setNewCap(parseInt(e.target.value) || 0)}
              min="1"
              max="1000"
              className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
            />
            <div className="text-xs text-gray-500 mt-2">
              Current: {capData.currentCap} members
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Impact Preview
            </label>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
              {newCap > capData.currentCap ? (
                <div className="text-green-400">
                  <div className="font-medium">Capacity Increase</div>
                  <div className="text-sm">+{newCap - capData.currentCap} additional slots</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Can approve {Math.min(newCap - capData.activeMembersCount, capData.waitlistCount)} from waitlist
                  </div>
                </div>
              ) : newCap < capData.currentCap ? (
                <div className="text-yellow-400">
                  <div className="font-medium">Capacity Decrease</div>
                  <div className="text-sm">-{capData.currentCap - newCap} fewer slots</div>
                  {newCap < capData.activeMembersCount && (
                    <div className="text-xs text-red-400 mt-1">
                      ⚠️ Below current member count
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-400">
                  <div className="font-medium">No Change</div>
                  <div className="text-sm">Capacity remains the same</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Warnings */}
        {newCap < capData.activeMembersCount && (
          <div className="mt-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
            <div className="flex items-start space-x-3">
              <span className="text-red-400 text-lg">⚠️</span>
              <div>
                <div className="font-medium text-red-400">Warning: Capacity Below Current Members</div>
                <div className="text-sm text-gray-300 mt-1">
                  Setting capacity to {newCap} when you have {capData.activeMembersCount} active members 
                  may cause issues. Consider a higher limit.
                </div>
              </div>
            </div>
          </div>
        )}

        {newCap > capData.currentCap + 50 && (
          <div className="mt-4 p-4 bg-yellow-900/30 border border-yellow-500/50 rounded-lg">
            <div className="flex items-start space-x-3">
              <span className="text-yellow-400 text-lg">💡</span>
              <div>
                <div className="font-medium text-yellow-400">Large Capacity Increase</div>
                <div className="text-sm text-gray-300 mt-1">
                  Increasing capacity by {newCap - capData.currentCap} slots. 
                  Ensure you have adequate resources to support more members.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4 mt-6">
          <button
            onClick={() => setNewCap(capData.currentCap)}
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition"
          >
            Reset
          </button>
          <button
            onClick={handleUpdateCap}
            disabled={newCap === capData.currentCap || isUpdating || newCap < 1}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              newCap !== capData.currentCap && newCap >= 1 && !isUpdating
                ? 'bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white'
                : 'bg-zinc-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isUpdating ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Updating...</span>
              </div>
            ) : (
              'Update Capacity'
            )}
          </button>
        </div>
      </div>

      {/* Success Confirmation */}
      {showConfirmation && (
        <div className="fixed top-4 right-4 bg-green-900 border border-green-500 p-4 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="font-medium text-green-400">Capacity Updated</div>
              <div className="text-sm text-gray-300">New limit: {capData.currentCap} members</div>
            </div>
          </div>
        </div>
      )}

      {/* Capacity History */}
      <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm">
        <h3 className="font-medium text-white mb-4">Recent Capacity Changes</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
            <div>
              <div className="text-white">Increased to 250 members</div>
              <div className="text-sm text-gray-400">January 15, 2024 at 10:30 AM</div>
            </div>
            <div className="text-green-400 text-sm">+50</div>
          </div>
          <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
            <div>
              <div className="text-white">Set initial capacity</div>
              <div className="text-sm text-gray-400">January 1, 2024 at 9:00 AM</div>
            </div>
            <div className="text-blue-400 text-sm">200</div>
          </div>
        </div>
      </div>
    </div>
  )
}
