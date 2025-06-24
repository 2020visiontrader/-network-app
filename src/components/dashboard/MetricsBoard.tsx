'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useApp } from '@/components/providers/AppProvider'
import { dedupeBy, getUniqueConnections, getOtherFounderId } from '@/utils/dataUtils'

interface NetworkMetrics {
  totalConnections: number
  verifiedConnections: number
  citiesReached: number
  topIndustry: string
  meetingsThisMonth: number
  introductionsMade: number
  growthPercentage: number
}

const mockMetrics: NetworkMetrics = {
  totalConnections: 27,
  verifiedConnections: 23,
  citiesReached: 5,
  topIndustry: 'Impact Media',
  meetingsThisMonth: 12,
  introductionsMade: 8,
  growthPercentage: 34
}

const mockIndustryData = [
  { name: 'Tech', count: 12, color: 'bg-purple-500' },
  { name: 'Finance', count: 8, color: 'bg-blue-500' },
  { name: 'Creative', count: 5, color: 'bg-yellow-500' },
  { name: 'Wellness', count: 2, color: 'bg-green-500' }
]

export default function MetricsBoard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'growth' | 'influence'>('overview')
  const [metrics, setMetrics] = useState<NetworkMetrics>(mockMetrics)
  const [industryData, setIndustryData] = useState(mockIndustryData)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useApp()
  const router = useRouter()

  useEffect(() => {
    if (!user) return

    loadNetworkMetrics()
  }, [user])

  const loadNetworkMetrics = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      setError('')
      
      // Clear existing data first
      setMetrics({
        totalConnections: 0,
        verifiedConnections: 0,
        citiesReached: 0,
        topIndustry: '',
        meetingsThisMonth: 0,
        introductionsMade: 0,
        growthPercentage: 0
      })

      // Get user's connections (accepted only)
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('connections')
        .select('founder_a_id, founder_b_id, status')
        .or(`founder_a_id.eq.${user.id},founder_b_id.eq.${user.id}`)
        .eq('status', 'accepted')

      if (connectionsError) throw connectionsError

      // Deduplicate connections (avoid counting A->B and B->A twice)
      const uniqueConnections = getUniqueConnections(connectionsData || [], user.id)
      const totalConnections = uniqueConnections.length

      // Get connected founder IDs
      const connectedFounderIds = uniqueConnections.map(conn => 
        getOtherFounderId(conn, user.id)
      )

      let citiesReached = 0
      let industryCount: { [key: string]: number } = {}

      if (connectedFounderIds.length > 0) {
        // Get founder details for connected users only
        const { data: foundersData, error: foundersError } = await supabase
          .from('founders')
          .select('location_city, industry')
          .in('id', connectedFounderIds)

        if (foundersError) throw foundersError

        // Calculate unique cities (deduplicated)
        const cities = foundersData
          ?.map(f => f.location_city)
          .filter(Boolean) || []
        
        const uniqueCities = [...new Set(cities)]
        citiesReached = uniqueCities.length

        // Calculate industry breakdown (deduplicated)
        foundersData?.forEach(founder => {
          if (founder.industry) {
            industryCount[founder.industry] = (industryCount[founder.industry] || 0) + 1
          }
        })
      }

      const topIndustries = Object.entries(industryCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 4)
        .map(([name, count], index) => ({
          name,
          count,
          color: ['bg-purple-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500'][index] || 'bg-gray-500'
        }))

      const topIndustry = topIndustries[0]?.name || 'None'

      // Get coffee chats this month (deduplicated)
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { data: coffeeChatsData, error: coffeeError } = await supabase
        .from('coffee_chats')
        .select('id, requester_id, requested_id, created_at')
        .or(`requester_id.eq.${user.id},requested_id.eq.${user.id}`)
        .gte('created_at', startOfMonth.toISOString())

      if (coffeeError) {
        console.warn('Coffee chats table not found:', coffeeError)
      }

      const meetingsThisMonth = coffeeChatsData?.length || 0

      // Update metrics state
      setMetrics({
        totalConnections,
        verifiedConnections: totalConnections, // All accepted connections are verified
        citiesReached,
        topIndustry,
        meetingsThisMonth,
        introductionsMade: Math.floor(totalConnections * 0.3), // Estimate
        growthPercentage: Math.floor(Math.random() * 50) + 10 // Mock growth
      })

      setIndustryData(topIndustries)

    } catch (error) {
      console.error('Error loading network metrics:', error)
      setError('Failed to load network metrics')
      // Keep mock data on error
      setMetrics(mockMetrics)
      setIndustryData(mockIndustryData)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-purple-400 flex items-center space-x-2">
          <span>📊</span>
          <span>Network Growth</span>
        </h2>
        <div className="flex items-center space-x-1 bg-zinc-800 rounded-lg p-1">
          {['overview', 'growth', 'influence'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'overview' | 'growth' | 'influence')}
              className={`px-3 py-1 text-xs rounded transition ${
                activeTab === tab
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-800/50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">{metrics.totalConnections}</div>
              <div className="text-xs text-gray-400">Total Connections</div>
              <div className="text-xs text-green-400 mt-1">+{metrics.growthPercentage}% this month</div>
            </div>
            <div className="bg-zinc-800/50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">{metrics.citiesReached}</div>
              <div className="text-xs text-gray-400">Cities Reached</div>
              <div className="text-xs text-blue-400 mt-1">Global network</div>
            </div>
          </div>

          {/* Industry Breakdown */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3">Connections by Industry</h3>
            <div className="space-y-2">
              {industryData.map((industry) => (
                <div key={industry.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${industry.color}`} />
                    <span className="text-sm text-gray-300">{industry.name}</span>
                  </div>
                  <span className="text-sm text-gray-400">{industry.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Field */}
          <div className="bg-gradient-to-r from-purple-900/30 to-yellow-900/30 border border-purple-500/30 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <span>🚀</span>
              <span className="text-sm font-medium text-white">Top Field</span>
            </div>
            <div className="text-lg font-semibold text-purple-400">{metrics.topIndustry}</div>
            <div className="text-xs text-gray-400">Most active connections</div>
          </div>
        </div>
      )}

      {activeTab === 'growth' && (
        <div className="space-y-6">
          {/* Growth Chart Placeholder */}
          <div className="bg-zinc-800/50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-300 mb-4">Monthly Growth</h3>
            <div className="h-32 flex items-end justify-between space-x-1">
              {[8, 12, 15, 18, 23, 27].map((value, index) => (
                <div key={`growth-${index}-${value}`} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t"
                    style={{ height: `${(value / 27) * 100}%` }}
                  />
                  <div className="text-xs text-gray-500 mt-1">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Growth Stats */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
              <span className="text-sm text-gray-300">This Month</span>
              <span className="text-green-400 font-semibold">+{metrics.growthPercentage}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
              <span className="text-sm text-gray-300">Meetings Booked</span>
              <span className="text-yellow-400 font-semibold">{metrics.meetingsThisMonth}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
              <span className="text-sm text-gray-300">Intros Made</span>
              <span className="text-blue-400 font-semibold">{metrics.introductionsMade}</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'influence' && (
        <div className="space-y-6">
          {/* Influence Score */}
          <div className="text-center">
            <div className="w-24 h-24 mx-auto bg-gradient-to-r from-purple-500 to-yellow-400 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-white">A+</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Network Influence</h3>
            <p className="text-sm text-gray-400">Top 15% of Network members</p>
          </div>

          {/* Response Rate Metrics */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Connection Quality</span>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={`star-${star}`} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Response Rate</span>
              <span className="text-green-400 font-semibold">94%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Referrals Given</span>
              <span className="text-purple-400 font-semibold">12</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
