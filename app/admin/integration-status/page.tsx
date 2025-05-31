'use client'
import { useState, useEffect } from 'react'
import HiveHexGrid from '@/components/HiveHexGrid'
import { checkSupabaseConnection } from '@/lib/supabase'
import { useSupabaseConnection, useRealTimeUpdate } from '@/hooks/useRealTimeUpdate'
import { logUserAction, getActiveAnnouncements } from '@/services/api'

interface IntegrationStatus {
  name: string
  description: string
  status: 'connected' | 'disconnected' | 'error' | 'loading'
  icon: string
  details?: string
  lastChecked?: string
}

export default function IntegrationStatusPage() {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const { isConnected: realtimeConnected } = useSupabaseConnection()
  const { isConnected: realtimeActive } = useRealTimeUpdate({
    table: 'announcements',
    showToast: false
  })

  const checkIntegrations = async () => {
    setIsRefreshing(true)
    const timestamp = new Date().toLocaleTimeString()

    try {
      // Check Supabase Connection
      const supabaseConnected = await checkSupabaseConnection()
      
      // Check Analytics Tracking
      let analyticsWorking = false
      try {
        analyticsWorking = await logUserAction('test-user', 'coffee_chat', { test: true })
      } catch (error) {
        console.error('Analytics test failed:', error)
      }

      // Check API Services
      let apiServicesWorking = false
      try {
        const announcements = await getActiveAnnouncements()
        apiServicesWorking = Array.isArray(announcements)
      } catch (error) {
        console.error('API services test failed:', error)
      }

      const newIntegrations: IntegrationStatus[] = [
        {
          name: 'Supabase Database',
          description: 'Core database connection and authentication',
          status: supabaseConnected ? 'connected' : 'error',
          icon: '🔌',
          details: supabaseConnected 
            ? 'Database queries executing successfully' 
            : 'Unable to connect to database',
          lastChecked: timestamp
        },
        {
          name: 'Real-time Sync',
          description: 'Live updates and subscriptions',
          status: realtimeConnected && realtimeActive ? 'connected' : 'error',
          icon: '📡',
          details: realtimeConnected && realtimeActive
            ? 'Real-time subscriptions active'
            : 'Real-time connection issues detected',
          lastChecked: timestamp
        },
        {
          name: 'Analytics Tracking',
          description: 'User action logging and metrics',
          status: analyticsWorking ? 'connected' : 'error',
          icon: '📊',
          details: analyticsWorking
            ? 'Analytics logging successfully'
            : 'Analytics tracking not responding',
          lastChecked: timestamp
        },
        {
          name: 'API Services',
          description: 'Custom API endpoints and functions',
          status: apiServicesWorking ? 'connected' : 'error',
          icon: '🛰',
          details: apiServicesWorking
            ? 'All API services responsive'
            : 'API services not responding correctly',
          lastChecked: timestamp
        }
      ]

      setIntegrations(newIntegrations)
    } catch (error) {
      console.error('Error checking integrations:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    checkIntegrations()
  }, [realtimeConnected, realtimeActive])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'disconnected': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'error': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'loading': return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return '✅'
      case 'disconnected': return '🟡'
      case 'error': return '⚠️'
      case 'loading': return '🔄'
      default: return '❓'
    }
  }

  const allConnected = integrations.every(integration => integration.status === 'connected')
  const hasErrors = integrations.some(integration => integration.status === 'error')

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-red-950/10 to-black text-white relative overflow-hidden">
      <HiveHexGrid />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 text-transparent bg-clip-text mb-4">
            Integration Status
          </h1>
          <p className="text-gray-300 text-lg">
            Monitor all system integrations and connections
          </p>
        </div>

        {/* Overall Status */}
        <div className={`mb-8 p-6 rounded-xl border ${
          allConnected 
            ? 'bg-green-900/30 border-green-500/50' 
            : hasErrors 
            ? 'bg-red-900/30 border-red-500/50'
            : 'bg-yellow-900/30 border-yellow-500/50'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-3xl">
                {allConnected ? '🟢' : hasErrors ? '🔴' : '🟡'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {allConnected 
                    ? 'All Systems Operational' 
                    : hasErrors 
                    ? 'System Issues Detected'
                    : 'Partial Connectivity'
                  }
                </h2>
                <p className="text-sm opacity-75">
                  {allConnected 
                    ? 'All integrations are working correctly'
                    : hasErrors
                    ? 'Some integrations need attention'
                    : 'Checking system status...'
                  }
                </p>
              </div>
            </div>
            
            <button
              onClick={checkIntegrations}
              disabled={isRefreshing}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50"
            >
              {isRefreshing ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Checking...</span>
                </div>
              ) : (
                'Refresh Status'
              )}
            </button>
          </div>
        </div>

        {/* Integration Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{integration.icon}</span>
                  <div>
                    <h3 className="font-semibold text-white">{integration.name}</h3>
                    <p className="text-sm text-gray-400">{integration.description}</p>
                  </div>
                </div>
                
                <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(integration.status)}`}>
                  <div className="flex items-center space-x-2">
                    <span>{getStatusIcon(integration.status)}</span>
                    <span className="capitalize">{integration.status}</span>
                  </div>
                </div>
              </div>

              {integration.details && (
                <div className="mb-3">
                  <p className="text-sm text-gray-300">{integration.details}</p>
                </div>
              )}

              {integration.lastChecked && (
                <div className="text-xs text-gray-500">
                  Last checked: {integration.lastChecked}
                </div>
              )}

              {integration.status === 'error' && (
                <div className="mt-4 p-3 bg-red-900/30 border border-red-500/30 rounded-lg">
                  <div className="text-sm text-red-300">
                    <strong>Troubleshooting:</strong>
                    <ul className="mt-2 space-y-1 text-xs">
                      {integration.name === 'Supabase Database' && (
                        <>
                          <li>• Check environment variables</li>
                          <li>• Verify Supabase project status</li>
                          <li>• Check network connectivity</li>
                        </>
                      )}
                      {integration.name === 'Real-time Sync' && (
                        <>
                          <li>• Check WebSocket connections</li>
                          <li>• Verify real-time subscriptions</li>
                          <li>• Check browser console for errors</li>
                        </>
                      )}
                      {integration.name === 'Analytics Tracking' && (
                        <>
                          <li>• Check usage_metrics table</li>
                          <li>• Verify API permissions</li>
                          <li>• Check function implementations</li>
                        </>
                      )}
                      {integration.name === 'API Services' && (
                        <>
                          <li>• Check service function responses</li>
                          <li>• Verify database permissions</li>
                          <li>• Check error logs</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* System Information */}
        <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm">
          <h3 className="font-semibold text-white mb-4">System Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-400">Environment</div>
              <div className="text-white">{process.env.NODE_ENV || 'development'}</div>
            </div>
            
            <div>
              <div className="text-gray-400">Last Deployment</div>
              <div className="text-white">
                {new Date().toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
            
            <div>
              <div className="text-gray-400">Version</div>
              <div className="text-white">1.0.0</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex space-x-4">
          <button
            onClick={() => window.location.href = '/admin'}
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition"
          >
            Back to Admin
          </button>
          
          <button
            onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
          >
            Open Supabase Dashboard
          </button>
          
          <button
            onClick={() => console.log('Integration status:', integrations)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Export Logs
          </button>
        </div>
      </div>
    </main>
  )
}
