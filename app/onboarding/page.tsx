'use client'
import Link from 'next/link'

export default function OnboardingWelcome() {
  return (
    <div className="flex-1 flex items-center justify-center px-6 py-20">
      <div className="max-w-2xl w-full bg-zinc-900/70 border border-zinc-800 rounded-2xl shadow-xl p-10 backdrop-blur-md text-center">
        
        {/* Hive Icon */}
        <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <svg width="40" height="40" viewBox="0 0 32 32" fill="none" className="text-white">
            <circle cx="10" cy="10" r="3" fill="currentColor"/>
            <circle cx="22" cy="10" r="3" fill="currentColor"/>
            <circle cx="16" cy="22" r="3" fill="currentColor"/>
            <line x1="10" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="2"/>
            <line x1="10" y1="10" x2="16" y2="22" stroke="currentColor" strokeWidth="2"/>
            <line x1="22" y1="10" x2="16" y2="22" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>

        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-yellow-400 text-transparent bg-clip-text mb-4">
          Welcome to Network
        </h1>
        
        <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-xl mx-auto">
          We're not just another platform. You're about to activate a relationship operating system 
          that connects you with the right people, at the right time, in the right context.
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-center space-x-3 text-sm text-gray-400">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Curated connections by niche + location</span>
          </div>
          <div className="flex items-center justify-center space-x-3 text-sm text-gray-400">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span>Smart introductions and travel matches</span>
          </div>
          <div className="flex items-center justify-center space-x-3 text-sm text-gray-400">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Mastermind groups and in-person hives</span>
          </div>
        </div>

        <Link 
          href="/onboarding/verify"
          className="inline-block w-full bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600 transition px-8 py-4 rounded-xl font-semibold text-white shadow-lg text-lg"
        >
          Start Building My Profile
        </Link>

        <p className="text-xs text-gray-500 mt-6">
          This will take about 5 minutes to complete
        </p>
      </div>
    </div>
  )
}
