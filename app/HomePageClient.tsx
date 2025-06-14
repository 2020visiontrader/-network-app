'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import HiveHexGrid from '@/components/HiveHexGrid'
import LoginFormComponent from '@/components/auth/LoginFormComponent'
import SignupFormComponent from '@/components/auth/SignupFormComponent'
import { supabase } from '@/lib/supabase'

function HomePageClient() {
  const [isLogin, setIsLogin] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    
    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          // Check if user exists in founders table
          const { data: founder } = await supabase
            .from('founders')
            .select('onboarding_completed')
            .eq('id', session.user.id)
            .single()

          if (founder?.onboarding_completed) {
            router.push('/dashboard')
          } else {
            router.push('/onboarding/verify')
          }
        }
      } catch (error) {
        console.error('Session check error:', error)
      } finally {
        setLoading(false)
      }
    }
    
    checkSession()
  }, [router])

  // Prevent hydration issues but allow static rendering
  if (!mounted) {
    return null
  }

  // Show loading state for client-side auth check
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white relative overflow-hidden">
      <HiveHexGrid />
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left side - Hero content */}
        <div className="flex-1">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Activate Your Hive
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            The private founder network for curated intros, smart coffee chats, and in-person hives.
          </p>
          <ul className="space-y-4 text-lg text-gray-400 mb-8">
            <li className="flex items-center">
              <span className="mr-3 text-2xl">🧠</span>
              Join curated groups of high-trust founders
            </li>
            <li className="flex items-center">
              <span className="mr-3 text-2xl">☕</span>
              Book meaningful coffee chats
            </li>
            <li className="flex items-center">
              <span className="mr-3 text-2xl">🌎</span>
              Meet up with aligned travelers, investors, and mentors
            </li>
          </ul>
          <div className="mt-8">
            <button 
              onClick={() => setIsLogin(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
            >
              Connect with Network
            </button>
          </div>
        </div>

        {/* Right side - Auth forms */}
        <div className="flex-1">
          <div className="bg-zinc-900/70 backdrop-blur-sm p-8 rounded-2xl border border-zinc-800 shadow-xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">
                {isLogin ? 'Welcome Back' : 'Join Network'}
              </h2>
              <p className="text-gray-400">
                {isLogin ? 'Connect with your network' : 'Limited to first 250 founders'}
              </p>
            </div>

            {isLogin ? (
              <LoginFormComponent onToggleForm={() => setIsLogin(false)} />
            ) : (
              <SignupFormComponent onToggleForm={() => setIsLogin(true)} />
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default HomePageClient
