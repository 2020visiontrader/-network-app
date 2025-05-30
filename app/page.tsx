'use client'
import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">
        Network
      </h1>
      <p className="text-gray-400 text-lg mb-8 text-center max-w-xl">
        Your intelligent relationship OS. Build connections, track interactions, and discover events tailored to your niche.
      </p>
      <div className="flex flex-wrap gap-4">
        <Link href="/login" className="bg-purple-600 px-5 py-3 rounded-xl hover:bg-purple-700 transition">
          Log In
        </Link>
        <Link href="/dashboard" className="bg-gray-800 px-5 py-3 rounded-xl hover:bg-gray-700 transition">
          Go to Dashboard
        </Link>
        <Link href="/hive" className="border border-purple-600 text-purple-400 px-5 py-3 rounded-xl hover:bg-purple-900/30 transition">
          Explore Hive
        </Link>
      </div>
    </main>
  )
}
