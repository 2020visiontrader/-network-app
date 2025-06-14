import dynamic from 'next/dynamic'
import HiveHexGrid from '@/components/HiveHexGrid'

// Create a simple static component for SSR (no interactive components)
function StaticHomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white relative overflow-hidden">
      <HiveHexGrid />
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left side - Hero content */}
        <div className="flex-1">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Activate Your Hive
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            The private founder network for curated intros, smart coffee chats, and in-person hives.
          </p>
          <ul className="space-y-4 text-lg text-gray-400 mb-8">
            <li className="flex items-center">
              <span className="mr-3 text-2xl">🧠</span>
              Join curated groups of high-trust founders
            </li>
            <li className="flex items-center">
              <span className="mr-3 text-2xl">☕</span>
              Book meaningful coffee chats
            </li>
            <li className="flex items-center">
              <span className="mr-3 text-2xl">🌎</span>
              Meet up with aligned travelers, investors, and mentors
            </li>
          </ul>
        </div>

        {/* Right side - Static auth form placeholder */}
        <div className="flex-1">
          <div className="bg-zinc-900/70 backdrop-blur-sm p-8 rounded-2xl border border-zinc-800 shadow-xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
              <p className="text-gray-400">Connect with your network</p>
            </div>
            
            {/* Static form for SSR */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500"
                  placeholder="Enter your email"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500"
                  placeholder="Enter your password"
                  disabled
                />
              </div>
              <button
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold opacity-50 cursor-not-allowed"
                disabled
              >
                Loading...
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

// Dynamic import for client-side functionality
const DynamicHomePage = dynamic(() => import('./HomePageClient'), {
  ssr: false,
  loading: () => <StaticHomePage />
})

export default function Home() {
  return <DynamicHomePage />
}
