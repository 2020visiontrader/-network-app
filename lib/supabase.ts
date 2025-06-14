import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

export const createClient = () => {
  // Only create browser client in browser environment
  if (typeof window === 'undefined') {
    // Return a mock client for server-side rendering
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null } }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null })
          })
        })
      })
    } as any
  }
  
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export default createClient

// Export instance for backward compatibility
export const supabase = createClient()
