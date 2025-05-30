'use client';

import NavBar from '@/components/NavBar'
import { useAuth } from '@/context/AuthContext'
import Loader from '@/components/Loader'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function AppContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const showNavBar = user && !isLoading

  if (isLoading) {
    return <Loader />
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {showNavBar && <NavBar />}
        <main className={`container-mobile ${showNavBar ? 'pt-4 pb-20' : 'pt-0 pb-4'} mobile-scroll`}>
          <div className="animate-fade-in">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  )
}
