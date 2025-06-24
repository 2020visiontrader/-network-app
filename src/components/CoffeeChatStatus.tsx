'use client';

import { useState, useEffect } from 'react';
import type { Database } from '@/lib/database.types';

type User = Database['public']['Tables']['users']['Row'];
type CoffeeChat = Database['public']['Tables']['coffee_chats']['Row'];

export default function CoffeeChatStatus() {
  const [status, setStatus] = useState<CoffeeChat | null>(null);
  const [city, setCity] = useState('');
  const [date, setDate] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [matches, setMatches] = useState<User[]>([]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/coffee-chats/status');
        const data = await response.json();
        if (data) {
          setStatus(data);
          setCity(data.city);
          setDate(data.availability_date);
          setIsVisible(data.profile_visible);
        }
      } catch (error) {
        console.error('Error fetching coffee chat status:', error);
      }
    };

    fetchStatus();
  }, []);

  useEffect(() => {
    const fetchMatches = async () => {
      if (!city || !isVisible) return;
      
      try {
        const response = await fetch(`/api/coffee-chats/matches?city=${encodeURIComponent(city)}`);
        const data = await response.json();
        setMatches(data);
      } catch (error) {
        console.error('Error fetching matches:', error);
      }
    };

    fetchMatches();
  }, [city, isVisible]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/coffee-chats/status', {
        method: status ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city,
          availability_date: date,
          profile_visible: isVisible,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update coffee chat status');
      }

      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error updating coffee chat status:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Coffee Chat Status</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Your City
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter your city"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Available Until
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={isVisible}
            onChange={(e) => setIsVisible(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Show my availability to others
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {status ? 'Update Status' : 'Set Status'}
        </button>
      </form>

      {isVisible && matches.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">People in {city}</h3>
          <div className="space-y-4">
            {matches.map(user => (
              <div key={user.id} className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold">{user.full_name}</h3>
                {user.city && (
                  <p className="text-sm text-gray-500">
                    Location: {user.city}
                  </p>
                )}
                {user.niche_tags && user.niche_tags.length > 0 && (
                  <p className="text-sm text-gray-400">
                    Interests: {user.niche_tags.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}