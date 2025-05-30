'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import createClient from '@/lib/supabase';

export default function Home() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    };

    checkAuth();
  }, []);

  return null;
}
