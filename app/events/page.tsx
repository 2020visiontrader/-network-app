'use client';

import { useApp } from '../../src/components/providers/AppProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Prevent static generation
export const dynamic = 'force-dynamic';

export default function EventsPage() {
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
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600">Discover and join founder events in your area</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Events</h2>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">Founder Meetup Downtown</h3>
                      <p className="text-gray-600 mt-1">Network with fellow entrepreneurs and share insights</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          🗓️ Tomorrow, 6:00 PM
                        </span>
                        <span className="flex items-center">
                          📍 Downtown Conference Center
                        </span>
                      </div>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Join
                    </button>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">Tech Startup Workshop</h3>
                      <p className="text-gray-600 mt-1">Learn about scaling your startup and raising funds</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          🗓️ Next Week, 2:00 PM
                        </span>
                        <span className="flex items-center">
                          📍 Innovation Hub
                        </span>
                      </div>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Join
                    </button>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">Virtual Coffee Chat</h3>
                      <p className="text-gray-600 mt-1">Join a virtual networking session with global founders</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          🗓️ Friday, 10:00 AM
                        </span>
                        <span className="flex items-center">
                          💻 Virtual
                        </span>
                      </div>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Join
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Categories</h2>
              <div className="space-y-2">
                <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <div className="font-medium text-blue-900">Networking</div>
                  <div className="text-sm text-blue-600">5 upcoming events</div>
                </button>
                <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <div className="font-medium text-green-900">Workshops</div>
                  <div className="text-sm text-green-600">3 upcoming events</div>
                </button>
                <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                  <div className="font-medium text-purple-900">Panel Discussions</div>
                  <div className="text-sm text-purple-600">2 upcoming events</div>
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Event</h2>
              <p className="text-gray-600 mb-4">Host your own founder event</p>
              <button 
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                onClick={() => router.push('/events/create')}
              >
                Create New Event
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
