'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  // Simple redirect after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-accent rounded-hive flex items-center justify-center mx-auto shadow-glow">
          <span className="text-white text-2xl">⬢</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-text mb-2">Network</h1>
          <p className="text-subtle">Professional Relationship Management Platform</p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-subtle">Redirecting to login...</p>

          <div className="flex space-x-4 justify-center">
            <Link
              href="/login"
              className="btn-mobile-primary px-6 py-3"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="btn-mobile-secondary px-6 py-3"
            >
              Sign Up
            </Link>
          </div>
        </div>

        <div className="text-xs text-subtle">
          <p>🚀 Deployed successfully on Vercel</p>
          <p>🔮 AI features coming soon</p>
        </div>
      </div>
    </div>
  );
}
