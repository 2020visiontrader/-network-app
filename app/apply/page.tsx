'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import HiveHexGrid from '@/components/HiveHexGrid'

interface ApplicationFormData {
  full_name: string
  email: string
  company_name: string
  linkedin_url: string
  funding_stage: string
  brief_description: string
}

export default function ApplyPage() {
  const [formData, setFormData] = useState<ApplicationFormData>({
    full_name: '',
    email: '',
    company_name: '',
    linkedin_url: '',
    funding_stage: 'pre-seed',
    brief_description: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Pre-fill form with Google user data if available
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setFormData(prev => ({
          ...prev,
          full_name: user.user_metadata?.full_name || '',
          email: user.email || ''
        }))
      }
    }
    getUser()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Submit founder application
      const { error: applicationError } = await supabase
        .from('founder_applications')
        .insert({
          full_name: formData.full_name,
          email: formData.email,
          company_name: formData.company_name,
          linkedin_url: formData.linkedin_url,
          funding_stage: formData.funding_stage,
          brief_description: formData.brief_description,
          application_status: 'pending'
        })

      if (applicationError) {
        console.error('Application error:', applicationError)
        setError('Failed to submit application. Please try again.')
        return
      }

      // Redirect to waitlist page
      router.push('/waitlist?message=application_submitted')

    } catch (error) {
      console.error('Submit error:', error)
      setError('Application submission failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      <HiveHexGrid />
      
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-10">
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-8 backdrop-blur-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">
              Apply to Join Network
            </h1>
            <p className="text-gray-400">
              Complete your founder application to join our exclusive community of 250 startup founders.
            </p>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="company_name" className="block text-sm font-medium text-gray-300 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                id="company_name"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Your startup or company"
              />
            </div>

            <div>
              <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-300 mb-2">
                LinkedIn Profile *
              </label>
              <input
                type="url"
                id="linkedin_url"
                name="linkedin_url"
                value={formData.linkedin_url}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>

            <div>
              <label htmlFor="funding_stage" className="block text-sm font-medium text-gray-300 mb-2">
                Funding Stage
              </label>
              <select
                id="funding_stage"
                name="funding_stage"
                value={formData.funding_stage}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="pre-seed">Pre-Seed</option>
                <option value="seed">Seed</option>
                <option value="series-a">Series A</option>
                <option value="series-b">Series B+</option>
                <option value="bootstrapped">Bootstrapped</option>
              </select>
            </div>

            <div>
              <label htmlFor="brief_description" className="block text-sm font-medium text-gray-300 mb-2">
                Tell us about your startup *
              </label>
              <textarea
                id="brief_description"
                name="brief_description"
                value={formData.brief_description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="What problem are you solving? What's your vision?"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 transition px-6 py-3 rounded-xl font-semibold text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting Application...</span>
                </div>
              ) : (
                'Submit Application'
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">
              Your application will be reviewed by our team. We'll notify you via email once approved.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
