'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ReconnectReminders from '@/components/ReconnectReminders';
import BirthdayReminders from '@/components/BirthdayReminders';
import CoffeeChatStatus from '@/components/CoffeeChatStatus';
import TravelCheckin from '@/components/TravelCheckin';
import FeatureStatus from '@/components/FeatureStatus';
import QuickActionsPanel from '@/components/QuickActionsPanel';
import { User } from '@/types';

export default function Dashboard() {
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
    <div className="space-y-6 gradient-mesh min-h-screen">
      {/* Demo Mode Signal */}
      {isDemoMode && (
        <div className="card-mobile border-accent/30 bg-surface/90 animate-slide-down">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-accent rounded-hive flex items-center justify-center shadow-glow">
                <svg className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-text text-sm">Simulation Mode Active</h3>
              <p className="text-xs text-subtle">
                Operating in demo environment. Data is ephemeral.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hivemind Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 gradient-subtle rounded-hive"></div>
        <div className="relative card-mobile p-6 border-accent/20">
          <div className="text-center">
            <div className="w-16 h-16 gradient-hive rounded-hive flex items-center justify-center mx-auto mb-4 shadow-glow pulse-hive">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-white">
                <circle cx="10" cy="10" r="3" fill="currentColor"/>
                <circle cx="22" cy="10" r="3" fill="currentColor"/>
                <circle cx="16" cy="22" r="3" fill="currentColor"/>
                <line x1="10" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="2"/>
                <line x1="10" y1="10" x2="16" y2="22" stroke="currentColor" strokeWidth="2"/>
                <line x1="22" y1="10" x2="16" y2="22" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h1 className="heading-lg-mobile mb-2 text-text">
              Neural Interface Active
            </h1>
            <p className="body-base-mobile text-subtle">
              Welcome back, {user.preferred_name || user.full_name}. Your relationship network is synchronized.
            </p>

            {/* Connection Status */}
            <div className="flex items-center justify-center space-x-4 mt-4 pt-4 border-t border-border">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent2 rounded-full pulse-hive"></div>
                <span className="text-xs text-subtle">Network Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full pulse-hive"></div>
                <span className="text-xs text-subtle">Signal Strong</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hivemind Dashboard Nodes */}
      <div className="space-y-6">
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <QuickActionsPanel />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <ReconnectReminders />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <BirthdayReminders />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <CoffeeChatStatus />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <TravelCheckin />
          </div>
        </div>

        {/* Feature Status - Only show in demo mode */}
        {isDemoMode && (
          <div className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <FeatureStatus showOnlyDisabled={true} />
          </div>
        )}
      </div>
    </div>
  );
}
