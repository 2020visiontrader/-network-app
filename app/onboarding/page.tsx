'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../src/lib/supabase'
import HiveHexGrid from '../../src/components/HiveHexGrid'

interface OnboardingData {
  full_name: string
  linkedin_url: string
  location_city: string
  industry: string
  tagline: string
  profile_photo_url: string
}

// 🧠 Fetch founder profile with safe fallback handling
async function fetchFounderProfile(userId: string) {
  try {
    console.log('[Founder Fetch] Attempting to fetch profile for user:', userId);
    
    const { data: founder, error } = await supabase
      .from('founders')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(); // ✅ Avoids throwing if no match is found

    if (error) {
      console.error('[Founder Fetch Error]', error.message);
      return {
        success: false,
        error: 'We could not access your founder profile. Please try again or contact support.',
        data: null
      };
    }

    if (!founder) {
      console.warn('[Founder Missing]', 'No profile found for user ID:', userId);
      return {
        success: false,
        error: 'Your profile was saved but we could not verify the update. Please try again.',
        data: null
      };
    }

    console.log('[Founder Found]', founder);
    return {
      success: true,
      error: null,
      data: founder
    };
  } catch (e) {
    console.error('[Unexpected Error]', e);
    return {
      success: false,
      error: 'Something went wrong while loading your profile.',
      data: null
    };
  }
}

export default function OnboardingPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState<OnboardingData>({
    full_name: '',
    linkedin_url: '',
    location_city: '',
    industry: '',
    tagline: '',
    profile_photo_url: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const checkUserAccess = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (!authUser) {
          router.push('/login')
          return
        }

        // Check if user exists in founders table
        const { data: founder, error: founderError } = await supabase
          .from('founders')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle() // ✅ Avoids PGRST116 error

        if (founderError) {
          console.error('[Founder Fetch Error]', founderError.message);
          router.push('/login')
          return
        }

        if (!founder) {
          console.log('[Founder Missing] User not found in founders table - redirecting to login');
          router.push('/login')
          return
        }

        if (founder.onboarding_completed) {
          // Already completed onboarding - redirect to dashboard
          router.push('/dashboard')
          return
        }

        // User needs to complete onboarding
        setUser(founder)
        setFormData({
          full_name: founder.full_name || '',
          linkedin_url: founder.linkedin_url || '',
          location_city: founder.location_city || '',
          industry: founder.industry || '',
          tagline: founder.tagline || '',
          profile_photo_url: founder.profile_photo_url || ''
        })
      } catch (error) {
        console.error('Error checking user access:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkUserAccess()
  }, [router])

  const niches = [
    'Technology',
    'Healthcare',
    'Finance',
    'E-commerce',
    'Education',
    'Real Estate',
    'Food & Beverage',
    'Travel & Hospitality',
    'Media & Entertainment',
    'Sustainability',
    'Other'
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      if (!user) {
        setError('User not authenticated')
        return
      }

      // Validate required fields
      if (!formData.full_name || !formData.linkedin_url || !formData.location_city || !formData.industry || !formData.tagline) {
        setError('Please fill in all required fields')
        return
      }

      console.log('[Onboarding] Starting save process for user:', user.id);

      // Update founders table with maybeSingle for safety
      const { data: updateResult, error: updateError } = await supabase
        .from('founders')
        .update({
          full_name: formData.full_name,
          linkedin_url: formData.linkedin_url,
          location_city: formData.location_city,
          industry: formData.industry,
          tagline: formData.tagline,
          profile_photo_url: formData.profile_photo_url,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .maybeSingle(); // ✅ Avoids PGRST116 error

      if (updateError) {
        console.error('[Onboarding Save Error]', updateError.message);
        setError('Failed to save your information. Please try again.')
        return
      }

      if (!updateResult) {
        console.warn('[Onboarding] Update returned no data - profile may not exist');
        setError('Profile update failed. Please contact support.')
        return
      }

      console.log('[Onboarding] Save successful, verifying profile...');

      // 🔁 Verify the profile was saved using our safe fetch function
      const fetchResult = await fetchFounderProfile(user.id);
      if (!fetchResult.success) {
        setError(fetchResult.error || 'Failed to verify profile save');
        return;
      }

      console.log('[Onboarding] Profile verified, redirecting to dashboard...');
      
      // Small delay to ensure consistency before redirect
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('[Onboarding] Unexpected error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      <HiveHexGrid />

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-10">
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-8 backdrop-blur-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">
              Complete Your Profile
            </h1>
            <p className="text-gray-400">
              Help us personalize your networking experience by completing your founder profile.
            </p>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
              <label htmlFor="location_city" className="block text-sm font-medium text-gray-300 mb-2">
                City *
              </label>
              <input
                type="text"
                id="location_city"
                name="location_city"
                value={formData.location_city}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="San Francisco, New York, London..."
              />
            </div>

            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-300 mb-2">
                Industry *
              </label>
              <select
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select your industry</option>
                {niches.map(niche => (
                  <option key={niche} value={niche}>{niche}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tagline" className="block text-sm font-medium text-gray-300 mb-2">
                Tagline *
              </label>
              <textarea
                id="tagline"
                name="tagline"
                value={formData.tagline}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="What are you building? Your mission in one sentence..."
              />
            </div>

            <div>
              <label htmlFor="profile_photo_url" className="block text-sm font-medium text-gray-300 mb-2">
                Profile Photo URL
              </label>
              <input
                type="url"
                id="profile_photo_url"
                name="profile_photo_url"
                value={formData.profile_photo_url}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://example.com/your-photo.jpg (optional)"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 transition px-6 py-3 rounded-xl font-semibold text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Completing Profile...</span>
                </div>
              ) : (
                'Complete Profile & Enter Network'
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">
              By completing your profile, you agree to our terms of service and privacy policy.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
