'use client';

import { createClient } from '@/utils/supabase-browser';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function withAuth(WrappedComponent: React.ComponentType) {
  return function AuthenticatedComponent(props: any) {
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
      const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.replace('/login');
        }
      };

      checkAuth();
    }, [router, supabase.auth]);

    return <WrappedComponent {...props} />;
  };
}
