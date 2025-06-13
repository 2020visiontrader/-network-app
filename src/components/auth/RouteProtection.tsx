'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import HiveHexGrid from '@/components/HiveHexGrid'
import type { Database } from '@/lib/database.types'

type User = Database['public']['Tables']['founders']['Row']

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
  { path: '/reset-password', requiresAuth: false, requiresComplete: false },
  { path: '/closed', requiresAuth: false, requiresComplete: false },
  { path: '/apply', requiresAuth: false, requiresComplete: false },

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
  { path: '/contacts', requiresAuth: true, requiresComplete: true, allowedStatuses: ['active'] },
  { path: '/events', requiresAuth: true, requiresComplete: true, allowedStatuses: ['active'] },
  { path: '/mastermind', requiresAuth: true, requiresComplete: true, allowedStatuses: ['active'] },
  { path: '/calendar', requiresAuth: true, requiresComplete: true, allowedStatuses: ['active'] },
  { path: '/ambassador', requiresAuth: true, requiresComplete: true, allowedStatuses: ['active'] },
  { path: '/status', requiresAuth: true, requiresComplete: true, allowedStatuses: ['active'] },
]

export default function RouteProtection({ children, user, isLoading = false }: RouteProtectionProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || isLoading || isRedirecting) return
    
    const matchingConfig = routeConfigs.find(config => 
      pathname?.startsWith(config.path) || pathname === config.path
    ) || { requiresAuth: true, requiresComplete: true, allowedStatuses: ['active'] }

    // Determine redirect path
    let redirectPath = null
    if (!user && matchingConfig.requiresAuth) {
      redirectPath = '/login'
    } else if (user) {
      if (!user.onboarding_completed && pathname !== '/onboarding' && matchingConfig.requiresComplete) {
        redirectPath = '/onboarding'
      } else if (matchingConfig.allowedStatuses && !user.is_active) {
        redirectPath = '/status'
      }
    }

    // Perform redirect if needed with debouncing
    if (redirectPath && pathname !== redirectPath && redirectPath !== '/') {
      setIsRedirecting(true)
      setTimeout(() => {
        router.replace(redirectPath)
        setTimeout(() => setIsRedirecting(false), 1000)
      }, 100)
    }

  }, [pathname, user, mounted, router, isLoading, isRedirecting])

  // Don't render anything during initial mount to prevent hydration issues
  if (!mounted) return null

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-300">Loading...</p>
        </div>
      </div>
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

    // Check status - use is_active instead of status
    if (routeConfig.allowedStatuses && !user.is_active) {
      return false
    }

    // Check profile completion - use onboarding_completed instead of profile_progress
    if (routeConfig.requiresComplete && !user.onboarding_completed) {
      return false
    }

    return true
  }

  const getRedirectPath = (): string | null => {
    if (!user) return '/login'

    if (!user.is_active) return '/suspended'
    if (!user.onboarding_completed) return '/onboarding/profile'

    return null
  }

  return {
    canAccess,
    getRedirectPath,
    isComplete: user ? !!user.onboarding_completed : false,
    isActive: user?.is_active || false
  }
}
