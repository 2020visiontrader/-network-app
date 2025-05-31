'use client'
import { useState } from 'react'

interface SystemMessage {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'maintenance'
  isActive: boolean
  showBanner: boolean
  createdAt: string
  createdBy: string
  expiresAt?: string
}

const mockMessages: SystemMessage[] = [
  {
    id: '1',
    title: 'Scheduled Maintenance',
    message: 'Network will undergo scheduled maintenance on January 20th from 2-4 AM PST. Some features may be temporarily unavailable.',
    type: 'maintenance',
    isActive: false,
    showBanner: false,
    createdAt: '2024-01-15T10:30:00Z',
    createdBy: 'admin@network.app',
    expiresAt: '2024-01-20T12:00:00Z'
  }
]

export default function SystemBroadcast() {
  const [messages, setMessages] = useState<SystemMessage[]>(mockMessages)
  const [isCreating, setIsCreating] = useState(false)
  const [newMessage, setNewMessage] = useState({
    title: '',
    message: '',
    type: 'info' as const,
    showBanner: false,
    expiresAt: ''
  })
  const [isSending, setIsSending] = useState(false)

  const handleCreateMessage = async () => {
    if (!newMessage.title || !newMessage.message) return

    setIsSending(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const message: SystemMessage = {
        id: Date.now().toString(),
        title: newMessage.title,
        message: newMessage.message,
        type: newMessage.type,
        isActive: true,
        showBanner: newMessage.showBanner,
        createdAt: new Date().toISOString(),
        createdBy: 'admin@network.app',
        expiresAt: newMessage.expiresAt || undefined
      }
      
      setMessages(prev => [message, ...prev])
      setNewMessage({
        title: '',
        message: '',
        type: 'info',
        showBanner: false,
        expiresAt: ''
      })
      setIsCreating(false)
    } catch (error) {
      console.error('Failed to create message:', error)
    } finally {
      setIsSending(false)
    }
  }

  const toggleMessageStatus = (messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isActive: !msg.isActive }
          : msg
      )
    )
  }

  const deleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId))
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
      case 'warning': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'error': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'maintenance': return 'text-purple-400 bg-purple-500/20 border-purple-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info': return 'ℹ️'
      case 'warning': return '⚠️'
      case 'error': return '🚨'
      case 'maintenance': return '🔧'
      default: return '📢'
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">System Broadcasts</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
        >
          Create Broadcast
        </button>
      </div>

      {/* Create Message Form */}
      {isCreating && (
        <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm">
          <h3 className="font-medium text-white mb-4">Create System Broadcast</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message Title
                </label>
                <input
                  type="text"
                  value={newMessage.title}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Scheduled Maintenance"
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message Type
                </label>
                <select
                  value={newMessage.type}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Message Content
              </label>
              <textarea
                value={newMessage.message}
                onChange={(e) => setNewMessage(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Enter your system message here. Supports markdown formatting."
                rows={4}
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white placeholder-gray-500 resize-none"
              />
              <div className="text-xs text-gray-500 mt-1">
                Supports markdown formatting
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Expiration Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={newMessage.expiresAt}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, expiresAt: e.target.value }))}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newMessage.showBanner}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, showBanner: e.target.checked }))}
                    className="w-4 h-4 text-red-600 bg-zinc-800 border-zinc-600 rounded focus:ring-red-500"
                  />
                  <span className="text-white">Show as persistent banner</span>
                </label>
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                onClick={() => setIsCreating(false)}
                className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMessage}
                disabled={!newMessage.title || !newMessage.message || isSending}
                className={`px-6 py-3 rounded-lg font-semibold transition ${
                  newMessage.title && newMessage.message && !isSending
                    ? 'bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white'
                    : 'bg-zinc-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSending ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Broadcasting...</span>
                  </div>
                ) : (
                  'Send Broadcast'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Messages */}
      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📢</span>
            </div>
            <p>No system broadcasts created yet</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`border rounded-xl p-6 ${getTypeColor(message.type)} ${message.isActive ? '' : 'opacity-50'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{getTypeIcon(message.type)}</span>
                  <div>
                    <h3 className="font-semibold text-white">{message.title}</h3>
                    <div className="text-sm opacity-75">
                      {message.type.charAt(0).toUpperCase() + message.type.slice(1)} • 
                      Created {formatDate(message.createdAt)}
                      {message.expiresAt && ` • Expires ${formatDate(message.expiresAt)}`}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleMessageStatus(message.id)}
                    className={`px-3 py-1 rounded text-sm transition ${
                      message.isActive 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-zinc-700 hover:bg-zinc-600 text-gray-300'
                    }`}
                  >
                    {message.isActive ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => deleteMessage(message.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="text-white mb-4">{message.message}</div>
              
              {message.showBanner && (
                <div className="text-sm opacity-75">
                  📌 Showing as persistent banner across all pages
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
