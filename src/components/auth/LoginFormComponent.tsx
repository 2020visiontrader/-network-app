'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/components/providers/AppProvider'
import { supabase } from '@/lib/supabase'

interface LoginFormProps {
  onToggleForm: () => void;
}

export default function LoginFormComponent({ onToggleForm }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [resetMessage, setResetMessage] = useState('')
  const router = useRouter()
  const { setUser } = useApp()

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      setError('')

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: process.env.NODE_ENV === 'production'
            ? 'https://appnetwork.netlify.app/auth/callback'
            : 'http://localhost:3001/auth/callback'
        }
      })

      if (error) {
        console.error('Google sign-in error:', error)
        setError('Google sign-in failed. Please try again.')
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error)
      setError('Google sign-in failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

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
        console.error('Auth error:', authError)
        setError(authError.message || 'Invalid email or password')
        return
      }

      if (!authData.user) {
        setError('Authentication failed')
        return
      }

      // Get founder data from founders table
      const { data: founderData, error: founderError } = await supabase
        .from('founders')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (founderError || !founderData) {
        console.error('Founder lookup error:', founderError)
        setError('Founder account not found. Please contact support or apply as a founder.')
        return
      }

      // The AppProvider will handle setting user state automatically
      // when the auth state changes, no need to manually set fake user objects
      
      // Just redirect to dashboard, the AppProvider will handle the rest
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Login error:', error)
      if (error.message && error.message.includes('Failed to fetch')) {
        setError('Connection failed. Please check your internet connection and try again.')
      } else {
        setError(error.message || 'Login failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first')
      return
    }

    setIsResettingPassword(true)
    setError('')
    setResetMessage('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://appnetwork.netlify.app/reset-password'
      })

      if (error) throw error

      setResetMessage('Password reset email sent! Check your inbox.')
    } catch (error: any) {
      setError(error.message || 'Failed to send reset email')
    } finally {
      setIsResettingPassword(false)
    }
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

      {resetMessage && (
        <div className="bg-green-900/30 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg text-sm mb-6">
          {resetMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm mb-1 text-gray-300">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm placeholder-gray-500 text-white"
            required
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="password" className="block text-sm text-gray-300">Password</label>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={isResettingPassword}
              className="text-xs text-purple-400 hover:text-purple-300 transition disabled:opacity-50"
            >
              {isResettingPassword ? 'Sending...' : 'Forgot password?'}
            </button>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
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

      {/* Social Login Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-zinc-900 text-gray-400">or</span>
        </div>
      </div>

      {/* Google Sign-In */}
      <button
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full bg-white hover:bg-gray-50 text-gray-900 font-medium py-3 px-4 rounded-xl border border-gray-300 transition duration-200 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span>Continue with Google</span>
      </button>

      {/* Success Message */}
      {router && new URLSearchParams(window.location.search).get('message') === 'signup_success' && (
        <div className="bg-green-900/30 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg text-sm text-center mt-4">
          Account created successfully! Please log in with your credentials.
        </div>
      )}

      {/* Login Instructions */}
      <div className="text-center mt-4 space-y-2">
        <div className="text-xs text-gray-600 space-y-1">
          <p>New to Network?</p>
          <p>• Sign up to join our community of 250 founding members</p>
          <p>• Complete your profile to unlock all features</p>
          <p>• Start networking immediately after registration</p>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Questions? Contact hello@network.app
        </p>
      </div>
    </div>
  )
}
