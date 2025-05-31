'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import HiveHexGrid from '@/components/HiveHexGrid'
import LoginFormComponent from '@/components/auth/LoginFormComponent'
import SignupFormComponent from '@/components/auth/SignupFormComponent'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
  const [isLogin, setIsLogin] = useState(true)
  const [checking, setChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session) {
          // User is logged in, check their profile status
          const { data: userData, error } = await supabase
            .from('users')
            .select('status, profile_progress')
            .eq('id', session.user.id)
            .single()

          if (error) {
            console.error('Error fetching user data:', error)
            setChecking(false)
            return
          }

          // Redirect based on user status and profile completion
          if (userData?.status === 'waitlisted') {
            router.push('/waitlist')
          } else if (!userData || userData.profile_progress < 100) {
            router.push('/onboarding/profile')
          } else if (userData.status === 'active') {
            router.push('/dashboard')
          } else {
            // User exists but has other status, show login
            setChecking(false)
          }
        } else {
          // No session, show login screen
          setChecking(false)
        }
      } catch (error) {
        console.error('Session check error:', error)
        setChecking(false)
      }
    }

    checkSession()
  }, [router])

  if (checking) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
        <HiveHexGrid />
        <div className="relative z-10 text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-300 animate-pulse">Checking login session...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col lg:flex-row items-center justify-center px-6 lg:px-24 relative overflow-hidden">
      {/* Interactive Hive Background */}
      <HiveHexGrid />

      {/* Glows */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-purple-800 opacity-20 blur-3xl animate-pulse"></div>
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-fuchsia-700 opacity-10 blur-2xl rotate-45"></div>

      {/* LEFT SIDE — VALUE PROP */}
      <div className="relative z-10 w-full lg:w-1/2 text-left py-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-purple-500 to-indigo-400 text-transparent bg-clip-text">
          Activate Your Hive
        </h1>
        <p className="text-gray-400 text-lg mb-6 max-w-xl">
          This isn't just another login screen. You're entering a private founder network designed for high-trust collaboration. Inside:
        </p>

        <ul className="text-sm text-white space-y-3 mb-8 list-disc list-inside">
          <li>🤝 Make curated intros between trusted contacts</li>
          <li>💡 Host or join mastermind groups with aligned founders</li>
          <li>☕ Schedule meaningful coffee chats — in person or remote</li>
          <li>🌎 Sync with fellow travelers, investors, and mentors</li>
          <li>💼 Discover high-trust co-founder, buy/sell/invest opportunities</li>
        </ul>

        <p className="text-xs text-gray-500 italic mb-6">
          Network is invite-only. If you're approved, your email will unlock full access.
        </p>

        <div className="flex space-x-4 text-sm">
          <button
            onClick={() => setIsLogin(true)}
            className={`px-4 py-2 rounded-lg transition ${
              isLogin ? 'text-purple-400 underline' : 'text-gray-400 hover:text-white'
            }`}
          >
            Already a member? Sign in
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`px-4 py-2 rounded-lg transition ${
              !isLogin ? 'text-purple-400 underline' : 'text-gray-400 hover:text-white'
            }`}
          >
            Not a member? Request access
          </button>
        </div>
      </div>

      {/* RIGHT SIDE — AUTH FORM */}
      <div className="relative z-10 w-full lg:w-[420px]">
        {isLogin ? <LoginFormComponent /> : <SignupFormComponent />}
      </div>
    </main>
  )
}
