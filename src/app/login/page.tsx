'use client';

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
    <div className="min-h-screen bg-background gradient-mesh flex items-center justify-center py-8 px-4 safe-area-top safe-area-bottom">
      <div className="relative w-full max-w-sm">
        {/* Hivemind Logo and Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="mx-auto w-16 h-16 gradient-hive rounded-hive flex items-center justify-center mb-6 shadow-glow pulse-hive">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-white">
              <circle cx="10" cy="10" r="3" fill="currentColor"/>
              <circle cx="22" cy="10" r="3" fill="currentColor"/>
              <circle cx="16" cy="22" r="3" fill="currentColor"/>
              <line x1="10" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="2"/>
              <line x1="10" y1="10" x2="16" y2="22" stroke="currentColor" strokeWidth="2"/>
              <line x1="22" y1="10" x2="16" y2="22" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <h1 className="heading-lg-mobile mb-2 text-text">Neural Interface</h1>
          <p className="body-base-mobile text-subtle">Authenticate to access the network</p>

          {/* Connection Status */}
          <div className="flex items-center justify-center space-x-2 mt-3">
            <div className="w-2 h-2 bg-accent2 rounded-full pulse-hive"></div>
            <span className="text-xs text-subtle">Network Available</span>
          </div>
        </div>

        {/* Hivemind Login Form */}
        <div className="card-mobile border-accent/20 animate-slide-up">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-surface border border-error/30 text-error px-4 py-3 rounded-hive animate-slide-down">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Authentication failed: {error}</span>
                </div>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text mb-2">
                  Neural ID
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field touch-target"
                  placeholder="Enter your neural identifier"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text mb-2">
                  Access Key
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field touch-target"
                  placeholder="Enter your access key"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-mobile-primary w-full"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Establishing connection...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>Connect to Network</span>
                  <div className="w-2 h-2 bg-white rounded-full pulse-hive"></div>
                </div>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <Link
              href="/signup"
              className="text-accent hover:text-accent-light font-medium transition-colors duration-300 touch-target inline-block"
            >
              Request network access
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
