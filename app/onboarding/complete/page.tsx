'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import OnboardingProgress from '@/components/OnboardingProgress'

export default function OnboardingComplete() {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    // Trigger confetti animation
    setShowConfetti(true)
    const timer = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex-1 flex flex-col">
      <OnboardingProgress 
        currentStep={6} 
        totalSteps={6} 
        stepTitle="Welcome to the Hive!" 
      />
      
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <div className={`w-2 h-2 rounded-full ${
                Math.random() > 0.5 ? 'bg-purple-500' : 'bg-yellow-400'
              }`} />
            </div>
          ))}
        </div>
      )}
      
      <div className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="max-w-2xl w-full bg-zinc-900/70 border border-zinc-800 rounded-2xl shadow-xl p-10 backdrop-blur-md text-center">
          
          {/* Success Animation */}
          <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg animate-pulse">
            <svg width="48" height="48" viewBox="0 0 32 32" fill="none" className="text-white">
              <circle cx="10" cy="10" r="3" fill="currentColor"/>
              <circle cx="22" cy="10" r="3" fill="currentColor"/>
              <circle cx="16" cy="22" r="3" fill="currentColor"/>
              <line x1="10" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="2"/>
              <line x1="10" y1="10" x2="16" y2="22" stroke="currentColor" strokeWidth="2"/>
              <line x1="22" y1="10" x2="16" y2="22" stroke="currentColor" strokeWidth="2"/>
              
              {/* Checkmark overlay */}
              <circle cx="16" cy="16" r="12" fill="rgba(34, 197, 94, 0.2)" stroke="#22c55e" strokeWidth="2"/>
              <path d="M12 16l2 2 4-4" stroke="#22c55e" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-yellow-400 text-transparent bg-clip-text mb-4">
            Your Hive is Now Active 🐝
          </h1>
          
          <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-xl mx-auto">
            Welcome to Network! We're using your preferences to curate your experience and 
            connect you with the right people at the right moments.
          </p>

          {/* What's Next */}
          <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-white mb-4">What happens next?</h3>
            <div className="space-y-3 text-sm text-gray-400 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>We'll start matching you with relevant connections in your city and industry</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>You'll receive smart introduction opportunities based on your expertise</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Get notified about relevant events, masterminds, and coffee chat opportunities</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>Access your relationship dashboard to track connections and interactions</span>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-gradient-to-r from-purple-900/20 to-yellow-900/20 border border-purple-500/30 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-white mb-3">💡 Pro Tips for Your First Week</h3>
            <div className="text-sm text-gray-300 space-y-2">
              <p>• Complete your profile with a professional photo and compelling tagline</p>
              <p>• Set your coffee chat availability to start meeting people</p>
              <p>• Join relevant industry groups and local hives in your area</p>
              <p>• Enable notifications to never miss connection opportunities</p>
            </div>
          </div>

          {/* CTA Button */}
          <Link 
            href="/dashboard"
            className="inline-block w-full bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600 transition px-8 py-4 rounded-xl font-semibold text-white shadow-lg text-lg mb-6"
          >
            Enter Dashboard
          </Link>

          <p className="text-xs text-gray-500">
            Need help getting started? Check out our{' '}
            <a href="#" className="text-purple-400 hover:text-purple-300 underline">
              quick start guide
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
