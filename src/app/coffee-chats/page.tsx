'use client';

import { useState, useEffect } from 'react';
import { withAuth } from '@/components/withAuth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';

type CoffeeChat = Database['public']['Tables']['coffee_chats']['Row'];
type User = Database['public']['Tables']['users']['Row'];

const CoffeeChatsPage = () => {
  const [myCoffeeChats, setMyCoffeeChats] = useState<CoffeeChat[]>([]);
  const [availableMatches, setAvailableMatches] = useState<(CoffeeChat & { user: User })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCoffeeChat, setNewCoffeeChat] = useState({
    city: '',
    date_available: '',
    public_visibility: true
  });

  const supabase = createClientComponentClient<Database>();

  const fetchMyCoffeeChats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('coffee_chats')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date_available', { ascending: true });

      if (error) throw error;
      setMyCoffeeChats(data || []);
    } catch (error) {
      console.error('Error fetching my coffee chats:', error);
    }
  };

  const fetchAvailableMatches = async () => {
    try {
      const response = await fetch('/api/coffee-chats/matches');
      if (response.ok) {
        const data = await response.json();
        setAvailableMatches(data);
      }
    } catch (error) {
      console.error('Error fetching available matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCoffeeChat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('coffee_chats')
        .insert([{
          ...newCoffeeChat,
          user_id: session.user.id
        }]);

      if (error) throw error;

      setNewCoffeeChat({
        city: '',
        date_available: '',
        public_visibility: true
      });
      setShowCreateForm(false);
      fetchMyCoffeeChats();
      fetchAvailableMatches();
    } catch (error) {
      console.error('Error creating coffee chat:', error);
    }
  };

  const deleteCoffeeChat = async (coffeeChatId: string) => {
    try {
      const { error } = await supabase
        .from('coffee_chats')
        .delete()
        .eq('id', coffeeChatId);

      if (error) throw error;
      fetchMyCoffeeChats();
      fetchAvailableMatches();
    } catch (error) {
      console.error('Error deleting coffee chat:', error);
    }
  };

  useEffect(() => {
    fetchMyCoffeeChats();
    fetchAvailableMatches();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Coffee Chats</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
        >
          Schedule Coffee Chat
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Schedule a Coffee Chat</h2>
          <form onSubmit={createCoffeeChat} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  City *
                  <input
                    type="text"
                    value={newCoffeeChat.city}
                    onChange={(e) => setNewCoffeeChat({...newCoffeeChat, city: e.target.value})}
                    placeholder="Where are you available?"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    required
                  />
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Available Date *
                  <input
                    type="date"
                    value={newCoffeeChat.date_available}
                    onChange={(e) => setNewCoffeeChat({...newCoffeeChat, date_available: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    required
                  />
                </label>
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={newCoffeeChat.public_visibility}
                onChange={(e) => setNewCoffeeChat({...newCoffeeChat, public_visibility: e.target.checked})}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Make this visible to other members
              </label>
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
              >
                Schedule Coffee Chat
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Coffee Chats */}
        <div>
          <h2 className="text-xl font-semibold mb-4">☕ My Coffee Chats</h2>
          <div className="space-y-4">
            {myCoffeeChats.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No coffee chats scheduled</p>
                <p className="text-gray-400 text-sm">Schedule one to meet new people!</p>
              </div>
            ) : (
              myCoffeeChats.map((chat) => (
                <div key={chat.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{chat.city}</h3>
                      <p className="text-gray-600">
                        {new Date(chat.date_available).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {chat.public_visibility ? 'Public' : 'Private'}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteCoffeeChat(chat.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Available Matches */}
        <div>
          <h2 className="text-xl font-semibold mb-4">🤝 Available Matches</h2>
          <div className="space-y-4">
            {availableMatches.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No matches available</p>
                <p className="text-gray-400 text-sm">Check back later or schedule your own!</p>
              </div>
            ) : (
              availableMatches.map((match) => (
                <div key={match.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{match.user?.full_name || 'Anonymous'}</h3>
                      <p className="text-gray-600">{match.city}</p>
                      <p className="text-gray-600">
                        {new Date(match.date_available).toLocaleDateString()}
                      </p>
                      {match.user?.role && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-1">
                          {match.user.role}
                        </span>
                      )}
                    </div>
                    <button className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary-dark transition-colors">
                      Connect
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">How Coffee Chats Work</h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• Schedule when and where you're available for coffee</li>
          <li>• See other members who are available in your city</li>
          <li>• Connect with people to expand your network</li>
          <li>• Make your availability public or keep it private</li>
        </ul>
      </div>
    </div>
  );
};

export default withAuth(CoffeeChatsPage);
