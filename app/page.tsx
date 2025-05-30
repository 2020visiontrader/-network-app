export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Network App is Live! ✅</h1>
        <p className="text-gray-400">Professional Relationship Management Platform</p>
        <div className="space-x-4">
          <a href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-block">
            Login
          </a>
          <a href="/signup" className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg inline-block">
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
}
