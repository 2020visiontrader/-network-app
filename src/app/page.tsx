export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mx-auto">
          <span className="text-white text-2xl">⬢</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold mb-2">Network</h1>
          <p className="text-gray-400">Professional Relationship Management Platform</p>
        </div>

        <div className="space-y-4">
          <div className="flex space-x-4 justify-center">
            <a
              href="/login"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Sign In
            </a>
            <a
              href="/signup"
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Sign Up
            </a>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          <p>🚀 Deployed successfully on Vercel</p>
          <p>🔮 AI features coming soon</p>
        </div>
      </div>
    </div>
  );
}
