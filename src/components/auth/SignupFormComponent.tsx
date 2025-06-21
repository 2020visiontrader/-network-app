'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const INDUSTRIES = [
  'Tech', 'AI', 'Web3', 'Finance', 'Ecommerce', 'SaaS', 'Education',
  'Wellness', 'Events', 'Fashion', 'Real Estate', 'Marketing', 'Creative',
  'Legal', 'Politics', 'Music Business', 'Content Creation', 'Venture Capital',
  'Coaching', 'Nonprofit'
]

const HOBBIES = [
  'Travel', 'Photography', 'Filmmaking', 'Fitness', 'Gaming', 'Meditation',
  'Cooking', 'Writing', 'Reading', 'Painting', 'Spirituality', 'Comedy',
  'Adventure Sports', 'Nature', 'Volunteering', 'Music', 'Design', 'Podcasting'
]

export default function SignupFormComponent() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    linkedin: '',
    company: '',
    dream: ''
  })
  const [selectedIndustries, setIndustries] = useState<string[]>([])
  const [selectedHobbies, setHobbies] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const toggle = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    setList((prev: string[]) =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value].slice(0, 3)
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true)
      setError('')

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: process.env.NODE_ENV === 'production'
            ? 'https://appnetwork.netlify.app/auth/callback'
            : 'http://localhost:3001/auth/callback'
        }
      })

      if (error) {
        console.error('Google sign-up error:', error)
        setError('Google sign-up failed. Please try again.')
      }
    } catch (error: unknown) {
      console.error('Google sign-up error:', error)
      setError('Google sign-up failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Validate required fields
      if (!formData.name || !formData.email) {
        setError('Please fill in your name and email')
        return
      }

      if (selectedIndustries.length === 0) {
        setError('Please select at least one industry')
        return
      }

      // Check if founder already exists or has pending application
      const { data: existingFounder } = await supabase
        .from('founders')
        .select('id, is_active')
        .eq('email', formData.email)
        .single()

      if (existingFounder) {
        setError('A founder account with this email already exists. Please try logging in instead.')
        return
      }

      // Check for existing application
      const { data: existingApplication } = await supabase
        .from('founder_applications')
        .select('application_status')
        .eq('email', formData.email)
        .single()

      if (existingApplication) {
        if (existingApplication.application_status === 'pending') {
          setError('You already have a pending founder application. Please wait for admin approval.')
        } else if (existingApplication.application_status === 'rejected') {
          setError('Your previous founder application was not approved.')
        }
        return
      }

      // Check if we've reached the 250 founder limit
      const { count: founderCount } = await supabase
        .from('founders')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      if (founderCount && founderCount >= 250) {
        setError('We have reached our initial capacity of 250 founders. Please check back later for future openings.')
        return
      }

      // Create Supabase auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: 'temp123!', // Temporary password - user will be prompted to change
        options: {
          data: {
            full_name: formData.name
          }
        }
      })

      if (authError) {
        console.error('Auth signup error:', authError)
        setError('Failed to create account. Please try again.')
        return
      }

      if (!authData.user) {
        setError('Failed to create account. Please try again.')
        return
      }

      // Create founder record directly (no approval needed for first 250)
      const { error: founderError } = await supabase
        .from('founders')
        .insert({
          id: authData.user.id, // Use auth user ID
          email: formData.email,
          full_name: formData.name,
          company_name: formData.company || 'Not specified',
          role: 'Founder',
          industry: selectedIndustries[0] || 'Technology',
          linkedin_url: formData.linkedin || null,
          is_verified: true, // Auto-verify first 250 founders
          is_active: true,
          onboarding_completed: false
        })

      if (founderError) {
        console.error('Founder creation error:', founderError)
        setError('Database error saving new user. Please contact support.')
        return
      }

      // Show success message
      setError('')
      alert('Account created successfully! You can now log in.')
      router.push('/login?message=signup_success')

    } catch (error) {
      setError('Signup failed. Please try again.')
      console.error('Signup error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-zinc-900 bg-opacity-60 border border-zinc-800 rounded-2xl shadow-xl p-8 backdrop-blur-lg max-h-[80vh] overflow-y-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-indigo-400 text-transparent bg-clip-text mb-2">
          Join Network
        </h2>
        <p className="text-gray-400 text-sm">
          Become one of our first 250 founding members
        </p>
        <div className="mt-2 text-sm text-purple-400">
          🚀 Instant access • Full features • Start networking today
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="name" className="text-sm block text-gray-300">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Jordan Oram"
            className="w-full px-4 py-3 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg placeholder-gray-500 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="text-sm block text-gray-300">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="you@example.com"
            className="w-full px-4 py-3 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg placeholder-gray-500 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        {/* Company */}
        <div>
          <label htmlFor="company" className="text-sm block text-gray-300">Company Name</label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            placeholder="Your startup or company"
            className="w-full px-4 py-3 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg placeholder-gray-500 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        {/* LinkedIn */}
        <div>
          <label htmlFor="linkedin" className="text-sm block text-gray-300">LinkedIn URL</label>
          <input
            type="url"
            id="linkedin"
            name="linkedin"
            value={formData.linkedin}
            onChange={handleInputChange}
            placeholder="https://linkedin.com/in/..."
            className="w-full px-4 py-3 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg placeholder-gray-500 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Industries */}
        <div>
          <label className="text-sm block mb-2 text-gray-300">Your Industry (pick up to 3)</label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {INDUSTRIES.map(industry => (
              <button
                key={industry}
                type="button"
                onClick={() => toggle(selectedIndustries, setIndustries, industry)}
                className={`px-3 py-1 rounded-full border text-xs transition ${
                  selectedIndustries.includes(industry)
                    ? 'bg-purple-600 text-white border-purple-400'
                    : 'bg-zinc-800 text-gray-400 border-zinc-700 hover:border-purple-500'
                }`}
              >
                {industry}
              </button>
            ))}
          </div>
        </div>

        {/* Hobbies */}
        <div>
          <label className="text-sm block mb-2 text-gray-300">Your Hobbies (pick up to 3)</label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {HOBBIES.map(hobby => (
              <button
                key={hobby}
                type="button"
                onClick={() => toggle(selectedHobbies, setHobbies, hobby)}
                className={`px-3 py-1 rounded-full border text-xs transition ${
                  selectedHobbies.includes(hobby)
                    ? 'bg-indigo-600 text-white border-indigo-400'
                    : 'bg-zinc-800 text-gray-400 border-zinc-700 hover:border-indigo-500'
                }`}
              >
                {hobby}
              </button>
            ))}
          </div>
        </div>

        {/* Reflective Question */}
        <div>
          <label htmlFor="dream" className="text-sm block mb-1 text-gray-300">
            What's your biggest professional goal right now?
          </label>
          <textarea
            id="dream"
            name="dream"
            value={formData.dream}
            onChange={handleInputChange}
            rows={3}
            placeholder="Write freely here..."
            className="w-full px-4 py-3 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg placeholder-gray-500 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-6 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 transition px-4 py-3 rounded-xl font-semibold text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Submitting...</span>
            </div>
          ) : (
            'Create Account'
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

      {/* Google Sign-Up */}
      <button
        onClick={handleGoogleSignUp}
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

      <div className="text-center mt-4">
        <p className="text-xs text-gray-500">
          Your account will be created instantly. Complete your profile to unlock all features.
        </p>
      </div>
    </div>
  )
}
