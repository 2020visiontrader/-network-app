'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
interface User {
  id: string
  name: string
  email: string
  status: 'active' | 'pending' | 'waitlisted' | 'suspended'
  profile_progress: number
  is_ambassador: boolean
  created_at: string
}

interface GlobalNavigationProps {
  user: User | null
  onLogout?: () => void
}

interface NavItem {
  label: string
  href: string
  icon: string
  isActive?: boolean
}

export default function GlobalNavigation({ user, onLogout }: GlobalNavigationProps) {
  const pathname = usePathname()
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

  const navItems: NavItem[] = [
    { label: 'Home', href: '/dashboard', icon: '🏠' },
    { label: 'Chats', href: '/coffee-chats', icon: '☕' },
    { label: 'Masterminds', href: '/masterminds', icon: '🧬' },
    { label: 'Events', href: '/events', icon: '📅' },
    { label: 'Explore', href: '/hive', icon: '🔍' },
    { label: 'Opportunities', href: '/opportunities', icon: '💼' },
    { label: 'Travel', href: '/travel', icon: '✈️' }
  ]

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setIsProfileMenuOpen(false)
    if (isProfileMenuOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isProfileMenuOpen])

  if (!user) return null

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="text-white font-semibold text-lg">Network</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href === '/dashboard' && pathname === '/') ||
                (pathname.startsWith(item.href) && item.href !== '/dashboard')

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                      : 'text-gray-300 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsProfileMenuOpen(!isProfileMenuOpen)
              }}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <span className="hidden sm:block text-white text-sm font-medium">
                {user.name || 'User'}
              </span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  isProfileMenuOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Profile Dropdown */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl py-2">
                <div className="px-4 py-3 border-b border-zinc-800">
                  <p className="text-white font-medium">{user.name}</p>
                  <p className="text-gray-400 text-sm">{user.email}</p>
                  {user.is_ambassador && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 mt-2">
                      🐝 Ambassador
                    </span>
                  )}
                </div>

                <div className="py-2">
                  <Link
                    href="/profile"
                    className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-zinc-800 transition-colors"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <span className="mr-3">👤</span>
                    Profile Settings
                  </Link>

                  <Link
                    href="/status"
                    className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-zinc-800 transition-colors"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <span className="mr-3">📊</span>
                    My Analytics
                  </Link>

                  {user.is_ambassador && (
                    <Link
                      href="/ambassador"
                      className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-zinc-800 transition-colors"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <span className="mr-3">🐝</span>
                      Ambassador Panel
                    </Link>
                  )}

                  <Link
                    href="/settings"
                    className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-zinc-800 transition-colors"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <span className="mr-3">⚙️</span>
                    Settings
                  </Link>
                </div>

                <div className="border-t border-zinc-800 pt-2">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false)
                      onLogout?.()
                    }}
                    className="flex items-center w-full px-4 py-2 text-red-400 hover:text-red-300 hover:bg-zinc-800 transition-colors"
                  >
                    <span className="mr-3">🚪</span>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-zinc-800 py-2">
          <div className="flex items-center justify-between space-x-1 overflow-x-auto">
            {navItems.slice(0, 5).map((item) => {
              const isActive = pathname === item.href ||
                (item.href === '/dashboard' && pathname === '/') ||
                (pathname.startsWith(item.href) && item.href !== '/dashboard')

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 min-w-0 ${
                    isActive
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <span className="text-lg mb-1">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
