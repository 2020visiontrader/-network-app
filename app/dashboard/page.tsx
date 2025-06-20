'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/hooks/useAuth';
import HiveHexGrid from '@/components/HiveHexGrid';
import { WelcomeCard, HiveFeed, MetricsBoard, ActionGrid } from '@/components/dashboard';
import { useApp } from '@/components/providers/AppProvider';
import { supabase } from '@/lib/supabase';

interface DashboardUser {
  id: string;
  email: string;
  full_name: string;
  preferred_name?: string;
  role: string;
  city?: string;
  industries?: string[];
  hobbies?: string[];
  profile_progress: number;
  is_ambassador: boolean;
  created_at: string;
  company_name?: string;
  member_number?: number;
}

function DashboardContent() {
  const { user: appUser } = useApp();
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadUserData();
  }, [appUser]);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Check if user is logged in
      if (!appUser) {
        router.push('/');
        return;
      }

      // Check if profile is complete
      if (appUser.profile_progress < 100 && appUser.status !== 'active') {
        router.push('/onboarding/profile');
        return;
      }

      // Get complete founder data from Supabase
      const { data: founderData, error: founderError } = await supabase
        .from('founders')
        .select(`
          id,
          email,
          full_name,
          company_name,
          role,
          location_city,
          industry,
          onboarding_completed,
          is_verified,
          member_number,
          created_at
        `)
        .eq('id', appUser.id)
        .single();

      if (founderError) {
        console.error('Error loading founder data:', founderError);
        setError('Failed to load founder data');
        return;
      }

      if (!founderData) {
        setError('Founder data not found');
        return;
      }

      // Convert to dashboard user format
      setUser({
        id: founderData.id,
        email: founderData.email,
        full_name: founderData.full_name,
        preferred_name: founderData.full_name.split(' ')[0], // First name as preferred
        role: founderData.is_verified ? 'verified_founder' : 'pending_founder',
        city: founderData.location_city || 'Location not set',
        industries: founderData.industry ? [founderData.industry] : [],
        hobbies: [],
        profile_progress: founderData.onboarding_completed ? 100 : 50,
        is_ambassador: false,
        created_at: founderData.created_at,
        company_name: founderData.company_name,
        member_number: founderData.member_number
      });

    } catch (error) {
      console.error('Error in loadUserData:', error);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Loading your Network...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={loadUserData}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No user data
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="text-center">
          <p className="text-gray-400">No user data available</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black text-white relative overflow-hidden">
      <HiveHexGrid />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Profile Completion Banner */}
        {user.profile_progress < 100 && (
          <div className="bg-yellow-600/20 border border-yellow-500/30 text-yellow-300 px-4 py-3 rounded-lg text-center">
            <span className="font-medium">⚡ Complete Your Profile</span> - Your profile is {user.profile_progress}% complete
            <button
              onClick={() => router.push('/onboarding/profile')}
              className="ml-4 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition"
            >
              Complete Profile
            </button>
          </div>
        )}

        {/* Welcome Card */}
        <WelcomeCard user={user} />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <HiveFeed />
            <ActionGrid />
          </div>

          {/* Right Column - Metrics */}
          <div className="space-y-6">
            <MetricsBoard />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
