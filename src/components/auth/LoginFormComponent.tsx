'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/components/providers/AppProvider'
import { supabase } from '@/lib/supabase'

export default function LoginFormComponent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { setUser } = useApp()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) {
        setError('Invalid email or password')
        return
      }

      if (!authData.user) {
        setError('Authentication failed')
        return
      }

      // Fetch user data from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (userError || !userData) {
        setError('User not found in database')
        return
      }

      const user = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        status: userData.status as 'active' | 'pending' | 'waitlisted' | 'suspended',
        profile_progress: userData.profile_progress,
        is_ambassador: userData.is_ambassador,
        created_at: userData.created_at
      }

      setUser(user)
      localStorage.setItem('network_user', JSON.stringify(user))

      // Redirect based on user status and profile completion
      if (user.status === 'waitlisted') {
        router.push('/waitlist')
      } else if (user.status === 'pending' || user.profile_progress < 100) {
        router.push('/onboarding/profile')
      } else if (user.status === 'active') {
        router.push('/dashboard')
      } else {
        setError('Account suspended. Please contact support.')
      }
    } catch (error) {
      setError('Login failed. Please try again.')
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = () => {
    setEmail('demo@network.app')
    setPassword('demo123')
  }

  return (
    <div className="bg-zinc-900 bg-opacity-60 border border-zinc-800 rounded-2xl shadow-xl p-10 backdrop-blur-lg">
      <div className="flex flex-col items-center mb-8">
        <div className="text-purple-400 text-4xl mb-2">🧠</div>
        <h2 className="text-2xl font-bold tracking-wide text-white">Activate Your Hive</h2>
        <p className="text-gray-400 text-sm text-center max-w-sm">
          This isn't just another login screen. You're entering a private founder network designed for high-trust collaboration.
        </p>
        <span className="text-green-500 text-xs mt-2">● Network Available</span>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm mb-1 text-gray-300">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm placeholder-gray-500 text-white"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm mb-1 text-gray-300">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm placeholder-gray-500 text-white"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 transition px-4 py-3 rounded-xl font-semibold text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Connecting...</span>
            </div>
          ) : (
            'Connect to Network'
          )}
        </button>
      </form>

      {/* Demo Login */}
      <div className="mt-6 text-center">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-zinc-900 text-gray-400">or</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDemoLogin}
          className="mt-4 w-full px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition border border-zinc-700 hover:border-zinc-600"
        >
          Try Demo Account
        </button>
      </div>

      {/* Login Instructions */}
      <div className="text-center mt-4 space-y-2">
        <div className="text-xs text-gray-600 space-y-1">
          <p>Test different flows:</p>
          <p>• waitlist@example.com → Waitlist page</p>
          <p>• new@example.com → Onboarding flow</p>
          <p>• Any other email → Full dashboard</p>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Admin access via Supabase Dashboard
        </p>
      </div>
    </div>
  )
}
