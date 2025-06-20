'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function withAuth(WrappedComponent: React.ComponentType) {
  return function AuthenticatedComponent(props: any) {
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
