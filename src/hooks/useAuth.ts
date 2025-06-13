'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Database } from '../../lib/database.types'

type AuthUser = Database['public']['Tables']['founders']['Row']

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await handleUser(session.user)
      } else {
        setLoading(false)
      }
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await handleUser(session.user)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setLoading(false)
        }
      }
    )

    getInitialSession()

    return () => subscription.unsubscribe()
  }, [])

  const handleUser = async (authUser: User) => {
    try {
      // Check if user exists in founders table
      const { data: founder, error } = await supabase
        .from('founders')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching founder:', error)
        setLoading(false)
        return
      }

      if (!founder) {
        // New user - create minimal founder record
        const { error: insertError } = await supabase
          .from('founders')
          .insert({
            id: authUser.id,
            email: authUser.email!,
            full_name: authUser.user_metadata?.full_name || '',
            company_name: '', // Required field - will be filled during onboarding
            role: '', // Required field - will be filled during onboarding
            onboarding_completed: false
          })

        if (insertError) {
          console.error('Error creating founder:', insertError)
          setLoading(false)
          return
        }

        // Fetch the newly created founder record
        const { data: newFounder, error: fetchError } = await supabase
          .from('founders')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (fetchError || !newFounder) {
          console.error('Error fetching new founder:', fetchError)
          setLoading(false)
          return
        }

        setUser(newFounder)
      } else {
        setUser(founder)
      }
    } catch (error) {
      console.error('Error in handleUser:', error)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return {
    user,
    loading,
    signOut
  }
}

export function useAuthGuard(requireAuth = true, requireOnboarding = true) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (requireAuth && !user) {
      router.push('/login')
      return
    }

    if (user && requireOnboarding && !user.onboarding_completed) {
      router.push('/onboarding')
      return
    }

    if (user && !requireOnboarding && user.onboarding_completed) {
      router.push('/dashboard')
      return
    }
  }, [user, loading, requireAuth, requireOnboarding, router])

  return { user, loading }
}
