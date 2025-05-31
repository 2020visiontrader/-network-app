'use client'
import { useEffect, useState } from 'react'

interface ConfirmationToastProps {
  contactName: string
  date: string
  time: string
}

export default function ConfirmationToast({ contactName, date, time }: ConfirmationToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])

  useEffect(() => {
    // Show toast with animation
    setIsVisible(true)

    // Create ripple effect
    const createRipples = () => {
      const newRipples = []
      for (let i = 0; i < 5; i++) {
        newRipples.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight
        })
      }
      setRipples(newRipples)
    }

    createRipples()

    // Clean up ripples after animation
    const rippleTimer = setTimeout(() => {
      setRipples([])
    }, 2000)

    return () => {
      clearTimeout(rippleTimer)
    }
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getTimeLabel = (timeId: string) => {
    const timeSlots = {
      'morning': 'Morning (9:00 AM - 11:00 AM)',
      'midday': 'Midday (11:00 AM - 2:00 PM)',
      'afternoon': 'Afternoon (2:00 PM - 5:00 PM)',
      'evening': 'Evening (5:00 PM - 7:00 PM)'
    }
    return timeSlots[timeId as keyof typeof timeSlots] || timeId
  }

  return (
    <>
      {/* Ripple Effects */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="fixed pointer-events-none z-40"
          style={{ left: ripple.x, top: ripple.y }}
        >
          <div className="w-4 h-4 bg-amber-400 rounded-full animate-ping opacity-75" />
        </div>
      ))}

      {/* Toast */}
      <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 transition-all duration-500 ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        <div className="bg-zinc-900/95 border border-amber-500/50 rounded-2xl shadow-2xl backdrop-blur-md p-8 max-w-md mx-auto">
          {/* Success Icon */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
              <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Coffee Chat Confirmed! ☕</h3>
            <p className="text-gray-300">You're all set for your meeting</p>
          </div>

          {/* Meeting Details */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="text-lg">👤</span>
                <div>
                  <div className="text-sm text-gray-400">Meeting with</div>
                  <div className="font-semibold text-white">{contactName}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-lg">📅</span>
                <div>
                  <div className="text-sm text-gray-400">Date</div>
                  <div className="font-semibold text-white">{formatDate(date)}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-lg">⏰</span>
                <div>
                  <div className="text-sm text-gray-400">Time</div>
                  <div className="font-semibold text-white">{getTimeLabel(time)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-black">1</span>
              </div>
              <div>
                <div className="font-medium text-white">Both parties notified</div>
                <div className="text-sm text-gray-400">You'll both receive confirmation emails</div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-black">2</span>
              </div>
              <div>
                <div className="font-medium text-white">Calendar reminder</div>
                <div className="text-sm text-gray-400">We'll remind you before your chat</div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-black">3</span>
              </div>
              <div>
                <div className="font-medium text-white">Location coordination</div>
                <div className="text-sm text-gray-400">Connect directly to finalize the venue</div>
              </div>
            </div>
          </div>

          {/* Celebration Message */}
          <div className="mt-6 text-center">
            <p className="text-amber-400 font-medium">
              🎉 Great connections start with great conversations!
            </p>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`} />
    </>
  )
}
