import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Supabase configuration with proper error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', { supabaseUrl, supabaseAnonKey: supabaseAnonKey ? 'Present' : 'Missing' })
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

console.log('Supabase client initialized:', { url: supabaseUrl, keyPresent: !!supabaseAnonKey })

// Create Supabase client with proper typing
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'network-app@1.0.0'
    }
  }
})

// Helper function to check connection with founder schema
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('founders').select('count').limit(1)
    if (error && error.message.includes('relation') && error.message.includes('does not exist')) {
      console.warn('Founders table not found - schema needs deployment')
      return true // Connection works, just need schema
    }
    return !error
  } catch (error) {
    console.error('Supabase connection error:', error)
    return false
  }
}
// Helper function to get current user
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting user:', error)
    return null
  }
  return user
}

