'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
interface User {
  id: string
  name: string
  email: string
  status: 'active' | 'pending' | 'suspended'
  profile_progress: number
  is_ambassador: boolean
  created_at: string
}
import HiveHexGrid from '@/components/HiveHexGrid'

interface RouteProtectionProps {
  children: React.ReactNode
  user: User | null
  isLoading?: boolean
}

interface RouteConfig {
  path: string
  requiresAuth: boolean
  requiresComplete: boolean
  allowedStatuses?: string[]
  redirectTo?: string
}

const routeConfigs: RouteConfig[] = [
  // Public routes
  { path: '/', requiresAuth: false, requiresComplete: false },
  { path: '/login', requiresAuth: false, requiresComplete: false },
  { path: '/signup', requiresAuth: false, requiresComplete: false },
  { path: '/thank-you', requiresAuth: false, requiresComplete: false },

  // Auth required but incomplete profile allowed
  { path: '/auth/callback', requiresAuth: true, requiresComplete: false },
  { path: '/onboarding', requiresAuth: true, requiresComplete: false },
  { path: '/onboarding/profile', requiresAuth: true, requiresComplete: false },
  { path: '/onboarding/expertise', requiresAuth: true, requiresComplete: false },
  { path: '/onboarding/connect', requiresAuth: true, requiresComplete: false },
  { path: '/onboarding/import', requiresAuth: true, requiresComplete: false },
  { path: '/onboarding/verify', requiresAuth: true, requiresComplete: false },
  { path: '/onboarding/complete', requiresAuth: true, requiresComplete: false },



  // Protected routes requiring complete profile
  { path: '/dashboard', requiresAuth: true, requiresComplete: true, allowedStatuses: ['active'] },
  { path: '/coffee-chats', requiresAuth: true, requiresComplete: true, allowedStatuses: ['active'] },
  { path: '/coffee-chat', requiresAuth: true, requiresComplete: true, allowedStatuses: ['active'] },
  { path: '/masterminds', requiresAuth: true, requiresComplete: true, allowedStatuses: ['active'] },
  { path: '/mastermind', requiresAuth: true, requiresComplete: true, allowedStatuses: ['active'] },
  { path: '/events', requiresAuth: true, requiresComplete: true, allowedStatuses: ['active'] },
  { path: '/events/create', requiresAuth: true, requiresComplete: true, allowedStatuses: ['active'] },
  { path: '/hive', requiresAuth: true, requiresComplete: true, allowedStatuses: ['active'] },
  { path: '/introductions', requiresAuth: true, requiresComplete: true, allowedStatuses: ['active'] },
  { path: '/opportunities', requiresAuth: true, requiresComplete: true, allowedStatuses: ['active'] },
  { path: '/travel', requiresAuth: true, requiresComplete: true, allowedStatuses: ['active'] },
  { path: '/contacts', requiresAuth: true, requiresComplete: true, allowedStatuses: ['active'] },
  { path: '/calendar', requiresAuth: true, requiresComplete: true, allowedStatuses: ['active'] },
  { path: '/birthdays', requiresAuth: true, requiresComplete: true, allowedStatuses: ['active'] },
  { path: '/profile', requiresAuth: true, requiresComplete: true, allowedStatuses: ['active'] },
  { path: '/settings', requiresAuth: true, requiresComplete: true, allowedStatuses: ['active'] },
  { path: '/status', requiresAuth: true, requiresComplete: true, allowedStatuses: ['active'] },

  // Ambassador routes
  { path: '/ambassador', requiresAuth: true, requiresComplete: true, allowedStatuses: ['active'] }
]

export default function RouteProtection({ children, user, isLoading }: RouteProtectionProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (isLoading) return

    const checkRoute = () => {
      // Find matching route config
      const routeConfig = routeConfigs.find(config =>
        pathname === config.path ||
        (config.path.includes('[') && pathname.startsWith(config.path.split('[')[0]))
      )

      // Default to protected route if no config found
      const config = routeConfig || {
        path: pathname,
        requiresAuth: true,
        requiresComplete: true,
        allowedStatuses: ['active']
      }

      // Check authentication requirement
      if (config.requiresAuth && !user) {
        router.push('/login')
        return
      }

      // If user exists, check their status and profile completion
      if (user) {
        // Check if user status is allowed for this route
        if (config.allowedStatuses && !config.allowedStatuses.includes(user.status)) {
          if (user.status === 'suspended') {
            router.push('/suspended')
            return
          }
        }

        // Check profile completion requirement
        if (config.requiresComplete && user.profile_progress < 100) {
          // Don't redirect if already on onboarding pages
          if (!pathname.startsWith('/onboarding')) {
            router.push('/onboarding/profile')
            return
          }
        }

        // Redirect completed users away from onboarding
        if (pathname.startsWith('/onboarding') && user.profile_progress >= 100) {
          router.push('/dashboard')
          return
        }


      }

      setIsChecking(false)
    }

    checkRoute()
  }, [user, isLoading, pathname, router])

  // Show loading state
  if (isLoading || isChecking) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-black via-purple-950/10 to-black text-white relative overflow-hidden">
        <HiveHexGrid />

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-purple-300 text-lg">Connecting to Network...</p>
            <p className="text-gray-400 text-sm mt-2">Verifying access permissions</p>
          </div>
        </div>
      </main>
    )
  }

  return <>{children}</>
}

// Hook for checking if user can access a specific route
export function useRouteAccess(user: User | null) {
  const pathname = usePathname()

  const canAccess = (targetPath: string): boolean => {
    if (!user) return false

    const routeConfig = routeConfigs.find(config => config.path === targetPath)
    if (!routeConfig) return false

    // Check status
    if (routeConfig.allowedStatuses && !routeConfig.allowedStatuses.includes(user.status)) {
      return false
    }

    // Check profile completion
    if (routeConfig.requiresComplete && user.profile_progress < 100) {
      return false
    }

    return true
  }

  const getRedirectPath = (): string | null => {
    if (!user) return '/login'

    if (user.status === 'suspended') return '/suspended'
    if (user.profile_progress < 100) return '/onboarding/profile'

    return null
  }

  return {
    canAccess,
    getRedirectPath,
    isComplete: user ? user.profile_progress >= 100 : false,
    isActive: user?.status === 'active'
  }
}
