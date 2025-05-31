'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import HiveHexGrid from '@/components/HiveHexGrid'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/login')
  }, [router])

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-purple-950/10 to-black text-white relative overflow-hidden">
      <HiveHexGrid />

      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-300">Connecting to Network...</p>
        </div>
      </div>
    </main>
  )
}
