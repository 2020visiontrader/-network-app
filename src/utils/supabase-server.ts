import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '../../lib/database.types'

export const createServerSupabaseClient = () => {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: { path: string }) => {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookies not being modifiable
          }
        },
        remove: (name: string, options: { path: string }) => {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle cookies not being modifiable
          }
        },
      },
    }
  )
}
