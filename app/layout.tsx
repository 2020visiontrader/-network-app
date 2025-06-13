import './globals.css'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import AppProvider from '@/components/providers/AppProvider'
import ErrorBoundary from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: {
    default: 'Network – Relationship OS',
    template: '%s | Network'
  },
  description: 'Build and manage your network with intention. Track relationships, plan meetups, and reconnect meaningfully.',
  keywords: ['networking', 'relationships', 'CRM', 'contacts', 'coffee chats', 'introductions'],
  authors: [{ name: 'Network Team' }],
  creator: 'Network',
  publisher: 'Network',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Network – Relationship OS',
    description: 'Build and manage your network with intention. Track relationships, plan meetups, and reconnect meaningfully.',
    siteName: 'Network',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Network - Relationship OS',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Network – Relationship OS',
    description: 'Build and manage your network with intention. Track relationships, plan meetups, and reconnect meaningfully.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  other: {
    'permissions-policy': 'clipboard-write=(self)'
  }
} as const

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script src="/error-handler.js" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <AppProvider>
            {children}
          </AppProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
