import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center space-y-6 max-w-2xl mx-auto px-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          Network
        </h1>
        <h2 className="text-2xl font-semibold text-gray-200">
          Professional Relationship Management Platform
        </h2>
        <p className="text-gray-400 text-lg">
          Build, maintain, and strengthen your professional network with intelligent relationship management.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors w-full sm:w-auto"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors w-full sm:w-auto"
          >
            Sign Up
          </Link>
        </div>
        <div className="mt-12 text-sm text-gray-500">
          <p>✅ Deployed successfully on Netlify</p>
          <p>🚀 Ready for production use</p>
          <p className="mt-2 text-xs">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
