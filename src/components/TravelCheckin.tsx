'use client';

import { useState, useEffect } from 'react';
import { TravelCheckin as TravelCheckinType, User } from '../types';

export default function TravelCheckin() {
  const [checkin, setCheckin] = useState<TravelCheckinType | null>(null);
  const [city, setCity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [travelers, setTravelers] = useState<User[]>([]);

  useEffect(() => {
    const fetchCheckin = async () => {
      try {
        const response = await fetch('/api/travel-checkins/current');
        const data = await response.json();
        if (data) {
          setCheckin(data);
          setCity(data.city);
          setStartDate(data.start_date || '');
          setEndDate(data.end_date || '');
          setIsVisible(data.is_visible);
        }
      } catch (error) {
        console.error('Error fetching travel checkin:', error);
      }
    };

    fetchCheckin();
  }, []);

  useEffect(() => {
    const fetchTravelers = async () => {
      if (!city || !isVisible) return;
      
      try {
        const response = await fetch(`/api/travel-checkins/travelers?city=${encodeURIComponent(city)}`);
        const data = await response.json();
        setTravelers(data);
      } catch (error) {
        console.error('Error fetching travelers:', error);
      }
    };

    fetchTravelers();
  }, [city, isVisible]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/travel-checkins', {
        method: checkin ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city,
          start_date: startDate || null,
          end_date: endDate || null,
          is_visible: isVisible,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update travel checkin');
      }

      const data = await response.json();
      setCheckin(data);
    } catch (error) {
      console.error('Error updating travel checkin:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Travel Check-in</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Destination City
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter city name"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={isVisible}
            onChange={(e) => setIsVisible(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Show my travel plans to others
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {checkin ? 'Update Check-in' : 'Create Check-in'}
        </button>
      </form>

      {isVisible && travelers.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Others in {city}</h3>
          <div className="space-y-4">
            {travelers.map((user) => (
              <div
                key={user.id}
                className="border p-4 rounded-lg shadow"
              >
                <h4 className="font-medium">{user.preferred_name || user.full_name}</h4>
                {user.interests && user.interests.length > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    Interests: {user.interests.join(', ')}
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