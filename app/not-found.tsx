'use client';

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background gradient-mesh flex flex-col items-center justify-center px-4">
      <div className="relative max-w-md w-full text-center">
        {/* Hivemind Network Icon */}
        <div className="mx-auto w-20 h-20 mb-8 animate-float">
          <div className="w-full h-full gradient-hive rounded-hive flex items-center justify-center shadow-glow pulse-hive">
            <svg
              width="40"
              height="40"
              viewBox="0 0 32 32"
              fill="none"
              className="text-white"
            >
              <circle cx="10" cy="10" r="3" fill="currentColor" />
              <circle cx="22" cy="10" r="3" fill="currentColor" />
              <circle cx="16" cy="22" r="3" fill="currentColor" />
              <line
                x1="10"
                y1="10"
                x2="22"
                y2="10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="10"
                y1="10"
                x2="16"
                y2="22"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="22"
                y1="10"
                x2="16"
                y2="22"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* 404 Content */}
        <div className="animate-fade-in">
          <h1 className="text-8xl font-bold text-text mb-4 animate-scale-in">404</h1>
          <h2 className="heading-md-mobile mb-4 animate-slide-up text-text" style={{ animationDelay: '0.1s' }}>
            Signal Lost
          </h2>
          <p className="body-base-mobile mb-8 animate-slide-up text-subtle" style={{ animationDelay: '0.2s' }}>
            The neural pathway you're seeking doesn't exist in the network.
            The connection may have been severed or rerouted.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <Link
            href="/dashboard?demo=true"
            className="btn-mobile-primary w-full"
          >
            Return to Hub
          </Link>
          <Link
            href="/"
            className="btn-mobile-secondary w-full"
          >
            Reconnect to Network
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-8 pt-8 border-t border-border animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <p className="text-sm text-subtle">
            Need assistance? Navigate to your{' '}
            <Link href="/contacts?demo=true" className="text-accent hover:text-accent-light font-medium transition-colors duration-300">
              node directory
            </Link>
            {' '}or establish new connections.
          </p>
        </div>
      </div>
    </div>
  )
}
