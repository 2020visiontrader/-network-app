'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import createClient from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push('/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col lg:flex-row items-center justify-center px-6 lg:px-24 relative overflow-hidden">
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

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/30 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Authentication failed: {error}</span>
            </div>
          </div>
        )}

        {/* FORM */}
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm mb-1 text-gray-300">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm placeholder-gray-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm mb-1 text-gray-300">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm placeholder-gray-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 transition px-4 py-3 rounded-xl font-semibold text-white shadow-md disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Establishing connection...</span>
              </div>
            ) : (
              'Connect to Network'
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
