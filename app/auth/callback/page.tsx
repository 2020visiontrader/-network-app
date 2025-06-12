'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the auth callback
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          router.push('/login?error=callback_failed')
          return
        }

        if (!data.session?.user) {
          console.error('No user session found')
          router.push('/login?error=no_session')
          return
        }

        const user = data.session.user

        // Check if user exists in founders table
        const { data: founder, error: founderError } = await supabase
          .from('founders')
          .select('onboarding_completed, member_number')
          .eq('id', user.id)
          .single()

        if (founderError && founderError.code !== 'PGRST116') {
          console.error('Error checking founder:', founderError)
          router.push('/login?error=database_error')
          return
        }

        if (founder) {
          // EXISTING FOUNDER - redirect based on onboarding status
          console.log(`Existing founder #${founder.member_number} signing in`)
          if (founder.onboarding_completed) {
            router.push('/dashboard')
          } else {
            router.push('/onboarding')
          }
          return
        }

        // FIRST-TIME USER - check if we can accept new founders (250 cap)
        console.log('First-time user detected, checking capacity...')

        try {
          // Create new founder record (triggers will handle limit checking and member number assignment)
          const { data: newFounder, error: insertError } = await supabase
            .from('founders')
            .insert({
              id: user.id,
              email: user.email!,
              full_name: user.user_metadata?.full_name || 'New Founder',
              profile_photo_url: user.user_metadata?.avatar_url || '',
              onboarding_completed: false
            })
            .select('member_number')
            .single()

          if (insertError) {
            // Check if it's the 250 limit error
            if (insertError.message.includes('Founder limit reached')) {
              console.log('Founder limit reached, redirecting to closed page')
              router.push('/closed')
              return
            }

            console.error('Error creating founder:', insertError)
            router.push('/login?error=creation_failed')
            return
          }

          console.log(`New founder created with member number: ${newFounder?.member_number}`)
          // Redirect to onboarding for new founder
          router.push('/onboarding')

        } catch (error) {
          console.error('Error in founder creation:', error)
          router.push('/login?error=unexpected')
        }
      } catch (error) {
        console.error('Callback error:', error)
        router.push('/login?error=unexpected')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg font-semibold">Finalizing authentication...</p>
        <p className="text-gray-400 text-sm mt-2">Please wait while we set up your account</p>
      </div>
    </div>
  )
}
