'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/components/providers/AppProvider';

export default function EventsClient() {
  const [mounted, setMounted] = useState(false);
  const { user, isLoading } = useApp();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Events</h1>
            <p className="mt-2 text-sm text-gray-700">
              Discover and join networking events in your area
            </p>
          </div>
          {user && (
            <div className="mt-4 sm:mt-0">
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Create Event
              </button>
            </div>
          )}
        </div>

        {/* Empty State */}
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🎪</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
          <p className="text-gray-500 mb-4">
            Be the first to create an event for the community!
          </p>
          {user && (
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
              Create First Event
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
