'use client';

import AppProvider, { useApp } from '@/components/providers/AppProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Prevent static generation
export const dynamic = 'force-dynamic';

function DashboardContent() {
  const { user, isLoading } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to your founder network dashboard</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Network Activity</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">12</div>
                  <div className="text-sm text-gray-600">Connections</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">3</div>
                  <div className="text-sm text-gray-600">Coffee Chats</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">7</div>
                  <div className="text-sm text-gray-600">Events</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-yellow-600">☕</div>
                  <div>
                    <div className="font-medium">Coffee Chat Request</div>
                    <div className="text-sm text-gray-600">New request from Sarah Wilson</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-blue-600">🎤</div>
                  <div>
                    <div className="font-medium">Upcoming Event</div>
                    <div className="text-sm text-gray-600">Founder Meetup tomorrow</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-green-600">🤝</div>
                  <div>
                    <div className="font-medium">New Connection</div>
                    <div className="text-sm text-gray-600">Connected with Mike Chen</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button 
                  className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  onClick={() => router.push('/coffee-chat')}
                >
                  <div className="font-medium text-blue-900">Schedule Coffee Chat</div>
                  <div className="text-sm text-blue-600">Connect with founders</div>
                </button>
                <button 
                  className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  onClick={() => router.push('/events')}
                >
                  <div className="font-medium text-green-900">Browse Events</div>
                  <div className="text-sm text-green-600">Join upcoming events</div>
                </button>
                <button 
                  className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                  onClick={() => router.push('/contacts')}
                >
                  <div className="font-medium text-purple-900">View Contacts</div>
                  <div className="text-sm text-purple-600">Manage your network</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}
