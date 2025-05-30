import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mx-auto">
          <span className="text-white text-2xl">⬢</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold mb-2">Network</h1>
          <p className="text-gray-400">Professional Relationship Management Platform</p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-500">Welcome to your relationship OS</p>

          <div className="flex space-x-4 justify-center">
            <Link
              href="/login"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>🚀 Deployed successfully on Vercel</p>
          <p>🔮 AI features coming soon</p>
          <p>🧠 Mastermind sessions ready</p>
        </div>
      </div>
    </main>
  );
}
