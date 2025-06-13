'use client'
import Link from 'next/link'
import HiveHexGrid from '@/components/HiveHexGrid'

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col lg:flex-row items-center justify-center px-6 lg:px-24 relative overflow-hidden">

      {/* Interactive Hive Background */}
      <HiveHexGrid />

      {/* Glows */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-purple-800 opacity-20 blur-3xl animate-pulse"></div>
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-fuchsia-700 opacity-10 blur-2xl rotate-45"></div>

      {/* LEFT SIDE — VALUE PROP */}
      <div className="relative z-10 w-full lg:w-1/2 text-left py-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-purple-500 to-indigo-400 text-transparent bg-clip-text">
          Activate Your Hive
        </h1>
        <p className="text-gray-400 text-lg mb-8 max-w-xl">
          Network is your relationship operating system. Stay meaningfully connected, show up at the right moment, and unlock a smarter social life.
        </p>

        <ul className="text-sm text-gray-300 space-y-3 mb-10">
          <li>💼 Track connections, check-ins, and conversation history</li>
          <li>🧠 Get smart intros based on niche and energy match</li>
          <li>🌍 Join local events and mastermind sessions</li>

        </ul>

        <p className="text-purple-400 text-sm">Not a member yet? <Link href="/signup" className="underline">Request access</Link></p>
      </div>

      {/* RIGHT SIDE — LOGIN FORM */}
      <div className="relative z-10 w-full lg:w-[420px] bg-zinc-900 bg-opacity-60 border border-zinc-800 rounded-2xl shadow-xl p-10 backdrop-blur-lg">
        <div className="flex flex-col items-center mb-8">
          <div className="text-purple-400 text-4xl mb-2">🧠</div>
          <h2 className="text-2xl font-bold tracking-wide text-white">Neural Interface</h2>
          <p className="text-gray-400 text-sm">Authenticate to access the network</p>
          <span className="text-green-500 text-xs mt-1">● Network Available</span>
        </div>

        {/* FORM */}
        <form className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm mb-1 text-gray-300">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm placeholder-gray-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm mb-1 text-gray-300">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm placeholder-gray-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 transition px-4 py-3 rounded-xl font-semibold text-white shadow-md"
          >
            Connect to Network
          </button>
        </form>
      </div>
    </main>
  );
}
