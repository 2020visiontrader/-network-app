import './globals.css'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import AppProvider from '@/components/providers/AppProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
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
  metadataBase: new URL('https://network-app.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Network – Relationship OS',
    description: 'Build and manage your network with intention. Track relationships, plan meetups, and reconnect meaningfully.',
    url: 'https://network-app.vercel.app',
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
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  )
}
