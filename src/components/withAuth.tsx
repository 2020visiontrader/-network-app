'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function withAuth<T extends object>(WrappedComponent: React.ComponentType<T>) {
  return function AuthenticatedComponent(props: T) {
    const supabase = createClientComponentClient();
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
