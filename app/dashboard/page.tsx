'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import HiveHexGrid from '@/components/HiveHexGrid';
import { WelcomeCard, HiveFeed, MetricsBoard, ActionGrid } from '@/components/dashboard';
import { User } from '@/types';

function DashboardContent() {
  const [user, setUser] = useState<User | null>(null);
  const searchParams = useSearchParams();
  const isDemoMode = searchParams.get('demo') === 'true';

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

    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user');
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, [isDemoMode]);

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black text-white relative overflow-hidden">
      <HiveHexGrid />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10 space-y-8">
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
