'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import HiveHexGrid from '../../src/components/HiveHexGrid';
import { WelcomeCard, HiveFeed, MetricsBoard, ActionGrid } from '../../src/components/dashboard';
import { useApp } from '../../src/components/providers/AppProvider';
import { supabase } from '../../src/lib/supabase';
import { fetchWithRetry, measureDbOperation, logRaceConditionDiagnostics } from '../../src/lib/db-utils';

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
      // Log the start of dashboard data loading with timestamp
      console.log(`🔄 Dashboard data loading started at ${new Date().toISOString()}`, {
        userId: appUser?.id
      });
      
      // Log the start of dashboard data loading with timestamp
      console.log(`🔄 Dashboard data loading started at ${new Date().toISOString()}`, {
        userId: appUser?.id
      });

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

      // Use measureDbOperation to track performance
      await measureDbOperation('dashboard-loadUserData', async () => {
        // Use our new fetchWithRetry utility with improved logging
        const { data: founderData, success, attempts, timeTaken, error: fetchError } = await fetchWithRetry(
          supabase,
          'founders',
          'id',
          appUser.id,
          `
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
          `,
          {
            maxRetries: 3,
            retryDelay: 1000,
            logPrefix: '🔄 Dashboard Profile Fetch'
          }
        );

        if (fetchError) {
          console.error('Error loading founder data:', fetchError);
          setError('Failed to load founder data');
          return;
        }

        if (!founderData) {
          console.error('❌ Founder data not found after multiple attempts', { 
            attempts, 
            timeTaken,
            userId: appUser.id,
            timestamp: new Date().toISOString(),
            // Log additional diagnostic information
            retryPattern: `${attempts} attempts over ${timeTaken}ms`,
            errorType: 'DATA_NOT_FOUND_AFTER_RETRIES'
          });
          setError('Founder data not found. Please complete onboarding first.');
          return;
        }

        // Enhanced success logging with more detailed information
        console.log('✅ Founder data loaded successfully', { 
          attempts, 
          timeTaken,
          userId: appUser.id,
          onboardingCompleted: founderData.onboarding_completed,
          timestamp: new Date().toISOString(),
          // Track if retries were needed or if first attempt succeeded
          requiredRetries: attempts > 1,
          // This helps identify potential race conditions
          possibleRaceCondition: attempts > 1 ? 'Yes - needed retries' : 'No - first attempt succeeded',
          // Performance categorization
          performance: timeTaken < 500 ? 'Fast' : timeTaken < 2000 ? 'Normal' : 'Slow'
        });

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

        {/* Network Summary Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div 
            className="bg-zinc-900/70 border border-zinc-800 p-4 rounded-xl backdrop-blur-sm cursor-pointer hover:border-purple-500/50 transition-all"
            onClick={() => router.push('/contacts')}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <span className="text-purple-400">🤝</span>
              </div>
              <div>
                <div className="text-lg font-bold text-white">27</div>
                <div className="text-xs text-gray-400">Connections</div>
              </div>
            </div>
          </div>
          
          <div 
            className="bg-zinc-900/70 border border-zinc-800 p-4 rounded-xl backdrop-blur-sm cursor-pointer hover:border-yellow-500/50 transition-all"
            onClick={() => router.push('/coffee-chats')}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                <span className="text-yellow-400">☕</span>
              </div>
              <div>
                <div className="text-lg font-bold text-white">3</div>
                <div className="text-xs text-gray-400">Coffee Chats</div>
              </div>
            </div>
          </div>
          
          <div 
            className="bg-zinc-900/70 border border-zinc-800 p-4 rounded-xl backdrop-blur-sm cursor-pointer hover:border-blue-500/50 transition-all"
            onClick={() => router.push('/events')}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <span className="text-blue-400">🎤</span>
              </div>
              <div>
                <div className="text-lg font-bold text-white">2</div>
                <div className="text-xs text-gray-400">Events RSVPs</div>
              </div>
            </div>
          </div>
          
          <div 
            className="bg-zinc-900/70 border border-zinc-800 p-4 rounded-xl backdrop-blur-sm cursor-pointer hover:border-green-500/50 transition-all"
            onClick={() => router.push('/mastermind')}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                <span className="text-green-400">🧬</span>
              </div>
              <div>
                <div className="text-lg font-bold text-white">1</div>
                <div className="text-xs text-gray-400">Masterminds</div>
              </div>
            </div>
          </div>
        </div>

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
