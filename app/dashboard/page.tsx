'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import HiveHexGrid from '@/components/HiveHexGrid';
import { WelcomeCard, HiveFeed, MetricsBoard, ActionGrid } from '@/components/dashboard';
import { useApp } from '@/components/providers/AppProvider';

interface DashboardUser {
  id: string;
  email: string;
  full_name: string;
  preferred_name?: string;
  role: string;
  city?: string;
  created_at: string;
}

function DashboardContent() {
  const { user: appUser } = useApp();
  const [user, setUser] = useState<DashboardUser | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const isDemoMode = searchParams.get('demo') === 'true';
  const isAdminPreview = searchParams.get('adminPreview') === 'true';

  useEffect(() => {
    if (isDemoMode) {
      // Set demo user data
      setUser({
        id: 'demo-user',
        email: 'demo@example.com',
        full_name: 'Demo User',
        preferred_name: 'Demo',
        role: 'member',
        city: 'San Francisco',
        created_at: new Date().toISOString(),
      });
      return;
    }

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

    // Convert app user to dashboard user format
    setUser({
      id: appUser.id,
      email: appUser.email,
      full_name: appUser.name,
      preferred_name: appUser.name,
      role: appUser.is_ambassador ? 'ambassador' : 'member',
      city: 'San Francisco', // Default city
      created_at: appUser.created_at,
    });
  }, [isDemoMode, appUser, router]);

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Loading your Network...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black text-white relative overflow-hidden">
      <HiveHexGrid />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Admin Preview Banner */}
        {isAdminPreview && (
          <div className="bg-red-600/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg text-center">
            <span className="font-medium">👑 Admin Preview Mode</span> - You're viewing the user experience as an admin
            <button
              onClick={() => window.close()}
              className="ml-4 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition"
            >
              Return to Admin
            </button>
          </div>
        )}

        {/* Demo Mode Signal */}
        {isDemoMode && (
          <div className="bg-blue-600/20 border border-blue-500/30 text-blue-300 px-4 py-3 rounded-lg text-center">
            <span className="font-medium">🧪 Demo Mode Active</span> - This is a preview of your Network dashboard with sample data
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
