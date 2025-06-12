'use client'
import { useState, useEffect, createContext, useContext } from 'react'
import { usePathname } from 'next/navigation'
import GlobalNavigation from '@/components/navigation/GlobalNavigation'
import RouteProtection from '@/components/auth/RouteProtection'
import { supabase } from '@/lib/supabase'
interface User {
  id: string
  name: string
  email: string
  status: 'active' | 'pending' | 'waitlisted' | 'suspended'
  profile_progress: number
  is_ambassador: boolean
  created_at: string
}

interface AppContextType {
  user: User | null
  setUser: (user: User | null) => void
  isLoading: boolean
  logout: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

interface AppProviderProps {
  children: React.ReactNode
}

export default function AppProvider({ children }: AppProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasMounted, setHasMounted] = useState(false)
  const pathname = usePathname()

  // Prevent hydration mismatch by ensuring client-side rendering
  useEffect(() => {
    setHasMounted(true)
  }, [])

  // Routes that should not show navigation
  const noNavRoutes = [
    '/',
    '/login',
    '/signup',
    '/thank-you',
    '/closed',
    '/suspended',
    '/auth/callback'
  ]

  // Routes that are part of onboarding
  const onboardingRoutes = pathname.startsWith('/onboarding')

  // Check if navigation should be shown
  const showNavigation = user &&
    !noNavRoutes.includes(pathname) &&
    !onboardingRoutes &&
    user.profile_progress >= 100 &&
    user.status === 'active'

  useEffect(() => {
    // Initialize user authentication only after mounting
    const initializeAuth = async () => {
      if (!hasMounted) return

      try {
        // Check for existing session
        const savedUser = localStorage.getItem('network_user')
        if (savedUser) {
          const userData = JSON.parse(savedUser)
          setUser(userData)
        }
        // No automatic demo user - require actual login
      } catch (error) {
        console.error('Auth initialization failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [pathname, hasMounted])

  const logout = async () => {
    try {
      // Sign out from Supabase if user is authenticated
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Supabase logout error:', error)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Always clear local state
      setUser(null)
      localStorage.removeItem('network_user')
      window.location.href = '/'
    }
  }

  const contextValue: AppContextType = {
    user,
    setUser,
    isLoading,
    logout
  }

  // Prevent hydration mismatch by showing loading state until mounted
  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <AppContext.Provider value={contextValue}>
      <RouteProtection user={user} isLoading={isLoading}>
        <div className="min-h-screen bg-black" suppressHydrationWarning>
          {showNavigation && (
            <GlobalNavigation user={user} onLogout={logout} />
          )}

          <div className={showNavigation ? 'pt-16' : ''}>
            {children}
          </div>
        </div>
      </RouteProtection>
    </AppContext.Provider>
  )
}
