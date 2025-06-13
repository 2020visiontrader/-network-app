import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../lib/database.types'

// Supabase configuration with proper error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Log initialization status (development only)
if (process.env.NODE_ENV === 'development') {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables:', {
      url: supabaseUrl ? 'Present' : 'Missing',
      key: supabaseAnonKey ? 'Present' : 'Missing'
    })
  }
}

console.log('Supabase client initialized:', { url: supabaseUrl, keyPresent: !!supabaseAnonKey })

// Create Supabase client with proper typing and enhanced realtime config
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
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    },
    headers: {
      // Add custom header to help identify client connections
      'X-Client-Type': 'network-app-realtime'
    }
  }
})

// Enhanced connection check with retry logic
export async function checkSupabaseConnection(retries = 3): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      const { error } = await supabase.from('founders').select('count').limit(1)
      if (error) {
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          console.warn('Founders table not found - schema needs deployment')
          return true // Connection works, just need schema
        }
        console.error(`Connection attempt ${i + 1} failed:`, error)
        if (i < retries - 1) await new Promise(r => setTimeout(r, 1000 * (i + 1)))
        continue
      }
      return true
    } catch (error) {
      console.error(`Connection attempt ${i + 1} failed with error:`, error)
      if (i < retries - 1) await new Promise(r => setTimeout(r, 1000 * (i + 1)))
    }
  }
  return false
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

