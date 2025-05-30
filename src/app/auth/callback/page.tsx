'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import createClient from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const supabase = createClient();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the URL hash parameters
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          // Set the session with the tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            throw error;
          }

          if (data.user) {
            setStatus('success');
            setMessage('Email confirmed successfully! Redirecting to dashboard...');
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
              router.push('/dashboard');
            }, 2000);
          }
        } else {
          // Try to get session from URL parameters (alternative method)
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            throw error;
          }

          if (data.session) {
            setStatus('success');
            setMessage('Already logged in! Redirecting to dashboard...');
            setTimeout(() => {
              router.push('/dashboard');
            }, 1000);
          } else {
            throw new Error('No authentication tokens found');
          }
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Authentication failed');
      }
    };

    handleAuthCallback();
  }, [router, supabase.auth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {status === 'loading' && 'Confirming your email...'}
            {status === 'success' && 'Email Confirmed!'}
            {status === 'error' && 'Confirmation Failed'}
          </h2>
        </div>
        
        <div className="mt-4">
          {status === 'loading' && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {status === 'success' && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">{message}</div>
            </div>
          )}
          
          {status === 'error' && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{message}</div>
              <div className="mt-4">
                <button
                  onClick={() => router.push('/login')}
                  className="text-blue-600 hover:text-blue-500 underline"
                >
                  Go to Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
