'use client';

import { withAuth } from '@/components/withAuth';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';

type TravelCheckin = Database['public']['Tables']['travel_checkins']['Row'];
type User = Database['public']['Tables']['users']['Row'];

const TravelPage = () => {
  const [city, setCity] = useState('');
  const [checkinDate, setCheckinDate] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [myCheckins, setMyCheckins] = useState<TravelCheckin[]>([]);
  const [othersCheckins, setOthersCheckins] = useState<(TravelCheckin & { user: User })[]>([]);

  const supabase = createClientComponentClient<Database>();

  const getMyTravelCheckins = async () => {
    const { data, error } = await supabase
      .from('travel_checkins')
      .select('*')
      .order('checkin_date', { ascending: true });

    if (error) {
      console.error('Error fetching my travel checkins:', error);
      return;
    }

    setMyCheckins(data);
  };

  const getOthersInCity = async (cityName: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from('travel_checkins')
      .select('*, user:users(*)')
      .eq('city', cityName)
      .eq('visible_to_others', true)
      .neq('user_id', session.user.id)
      .order('checkin_date', { ascending: true });

    if (error) {
      console.error('Error fetching others travel checkins:', error);
      return;
    }

    setOthersCheckins(data);
  };

  const submitTravelCheckin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from('travel_checkins')
      .insert([
        {
          user_id: session.user.id,
          city,
          checkin_date: checkinDate || null,
          visible_to_others: isVisible,
        },
      ]);

    if (error) {
      console.error('Error submitting travel checkin:', error);
      return;
    }

    setCity('');
    setCheckinDate('');
    getMyTravelCheckins();
    if (city) getOthersInCity(city);
  };

  useEffect(() => {
    getMyTravelCheckins();
  }, []);

  useEffect(() => {
    if (city) {
      getOthersInCity(city);
    }
  }, [city]);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Travel Check-ins</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">🗺 My Travel Plans</h2>
        <form onSubmit={submitTravelCheckin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              I'll be in
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                required
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date (optional)
              <input
                type="date"
                value={checkinDate}
                onChange={(e) => setCheckinDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isVisible}
              onChange={(e) => setIsVisible(e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Let others know I'll be there
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
          >
            Add Travel Plan
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">🌎 My Travel Check-ins</h2>
        <div className="space-y-4">
          {myCheckins.map((checkin) => (
            <div
              key={checkin.id}
              className="flex items-center justify-between border-b pb-4"
            >
              <div>
                <p className="font-medium">{checkin.city}</p>
                {checkin.checkin_date && (
                  <p className="text-sm text-gray-500">
                    {new Date(checkin.checkin_date).toLocaleDateString()}
                  </p>
                )}
              </div>
              <span className={`px-2 py-1 rounded-full text-sm ${
                checkin.visible_to_others
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {checkin.visible_to_others ? 'Visible' : 'Private'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {city && othersCheckins.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            📍 Others in {city}
          </h2>
          <div className="space-y-4">
            {othersCheckins.map((checkin) => (
              <div
                key={checkin.id}
                className="flex items-center justify-between border-b pb-4"
              >
                <div>
                  <p className="font-medium">{checkin.user.full_name}</p>
                  {checkin.checkin_date && (
                    <p className="text-sm text-gray-500">
                      {new Date(checkin.checkin_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default withAuth(TravelPage);
