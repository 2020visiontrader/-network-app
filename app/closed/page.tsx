'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import HiveHexGrid from '@/components/HiveHexGrid'

export default function ClosedPage() {
  const router = useRouter()
  const [founderCount, setFounderCount] = useState<number>(250)

  useEffect(() => {
    const getFounderCount = async () => {
      try {
        const { count } = await supabase
          .from('founders')
          .select('*', { count: 'exact', head: true })

        if (count !== null) {
          setFounderCount(count)
        }
      } catch (error) {
        console.error('Error fetching founder count:', error)
      }
    }

    getFounderCount()
  }, [])

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      <HiveHexGrid />
      
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-20">
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-8 backdrop-blur-sm text-center">
          
          {/* Lock Icon */}
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">
            Network is at Capacity
          </h1>
          
          <p className="text-xl text-gray-300 mb-6">
            Our founding cohort of 250 founders has been locked in.
          </p>
          
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-white mb-3">
              What's Next?
            </h2>
            <p className="text-gray-300 mb-4">
              We're currently in our founding phase, building the most exclusive network 
              of startup founders. Our next cohort will open in 6 months.
            </p>
            <p className="text-gray-300">
              Stay connected to be the first to know when applications reopen.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a
              href="https://twitter.com/network"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              <span>Follow @network</span>
            </a>
            
            <a
              href="https://instagram.com/network"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.244c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.781c-.315 0-.612-.123-.833-.344-.221-.221-.344-.518-.344-.833 0-.315.123-.612.344-.833.221-.221.518-.344.833-.344s.612.123.833.344c.221.221.344.518.344.833 0 .315-.123.612-.344.833-.221.221-.518.344-.833.344zm-3.332 9.781c-1.297 0-2.448-.49-3.323-1.297-.928-.875-1.418-2.026-1.418-3.244s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.244c-.875.807-2.026 1.297-3.323 1.297z"/>
              </svg>
              <span>Follow @network</span>
            </a>
          </div>

          {/* Stats */}
          <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">250</div>
                <div className="text-sm text-gray-400">Founding Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-400">6</div>
                <div className="text-sm text-gray-400">Months Until Next Cohort</div>
              </div>
            </div>
          </div>

          {/* Return Home Button */}
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition"
          >
            Return to Home
          </button>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Questions? Contact us at hello@network.app
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
