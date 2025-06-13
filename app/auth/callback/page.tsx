'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '../../../lib/database.types';

export default function AuthCallback() {
  const router = useRouter();
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth error:', error);
          router.push('/login?error=auth_failed');
          return;
        }

        if (session?.user) {
          // Check if user exists in founders table
          const { data: founder } = await supabase
            .from('founders')
            .select('id, onboarding_completed')
            .eq('id', session.user.id)
            .single();

          if (founder) {
            if (founder.onboarding_completed) {
              router.push('/dashboard');
            } else {
              router.push('/onboarding');
            }
          } else {
            // New user needs to complete onboarding
            router.push('/onboarding');
          }
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        router.push('/login?error=unexpected');
      }
    };

    handleAuthCallback();
  }, [router, supabase]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Authenticating...
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Please wait while we complete your sign in.
        </p>
      </div>
    </div>
  );
}
