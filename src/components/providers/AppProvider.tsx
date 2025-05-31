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
  const pathname = usePathname()

  // Routes that should not show navigation
  const noNavRoutes = [
    '/',
    '/login',
    '/signup',
    '/thank-you',
    '/waitlist',
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
    // Initialize user authentication
    const initializeAuth = async () => {
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
  }, [pathname])

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

  return (
    <AppContext.Provider value={contextValue}>
      <RouteProtection user={user} isLoading={isLoading}>
        <div className="min-h-screen bg-black">
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
