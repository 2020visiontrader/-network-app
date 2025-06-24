'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import LoginFormComponent from '@/components/auth/LoginFormComponent';

export default function Home() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if user profile is complete
        const { data: profile, error } = await supabase
          .from('founders')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (!profile || !profile.full_name || !profile.niche_tags) {
          router.push('/onboarding');
        } else {
          router.push('/dashboard');
        }
      }
    };
    checkSession();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col md:flex-row gap-12">
        <div className="md:w-1/2 space-y-6">
          <h1 className="text-5xl font-bold text-gray-900">
            Activate Your Hive
          </h1>
          <ul className="space-y-4 text-lg text-gray-600">
            <li className="flex items-center gap-2">
              ☕️ Coffee chats with vetted founders
            </li>
            <li className="flex items-center gap-2">
              🤝 Smart intros based on your goals
            </li>
            <li className="flex items-center gap-2">
              🧠 Mastermind groups for accountability
            </li>
          </ul>
        </div>

        <div className="md:w-1/2 bg-white p-8 rounded-xl shadow-lg">
          <div className="space-y-6">
            <LoginFormComponent />
            <p className="text-sm text-center text-gray-500 mt-4">
              Limited to first 250 founders
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
