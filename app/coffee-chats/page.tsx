'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import type { Database } from '../../lib/database.types';

// Proper type definitions
type Founder = Database['public']['Tables']['founders']['Row'];
type CoffeeChat = Database['public']['Tables']['coffee_chats']['Row'];

// Extended type for coffee chats with founder details
interface ExtendedCoffeeChat extends CoffeeChat {
  requester?: {
    id: string;
    full_name: string;
    email: string;
    company_name: string;
  } | null;
  requested?: {
    id: string;
    full_name: string;
    email: string;
    company_name: string;
  } | null;
}

// Simplified founder interface for the dropdown
interface SimpleFounder {
  id: string;
  full_name: string;
  email: string;
  company_name: string;
  location_city: string | null;
}

interface NewCoffeeChatForm {
  requested_id: string;
  proposed_time: string;
  meeting_type: 'virtual' | 'in-person';
  location_or_link: string;
  requester_message: string;
}

const CoffeeChatsPage = () => {
  const [myCoffeeChats, setMyCoffeeChats] = useState<ExtendedCoffeeChat[]>([]);
  const [founders, setFounders] = useState<SimpleFounder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCoffeeChat, setNewCoffeeChat] = useState<NewCoffeeChatForm>({
    requested_id: '',
    proposed_time: '',
    meeting_type: 'virtual',
    location_or_link: '',
    requester_message: ''
  });
  const [user, setUser] = useState<any>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchCoffeeChats();
      fetchFounders();
    }
  }, [user]);

  const fetchUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      setUser(user);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchCoffeeChats = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('coffee_chats')
        .select(`
          *,
          requester:founders!requester_id(id, full_name, email, company_name),
          requested:founders!requested_id(id, full_name, email, company_name)
        `)
        .or(`requester_id.eq.${user.id},requested_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyCoffeeChats(data || []);
    } catch (error) {
      console.error('Error fetching coffee chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFounders = async () => {
    try {
      const { data, error } = await supabase
        .from('founders')
        .select('id, full_name, email, company_name, location_city')
        .eq('is_active', true)
        .neq('id', user?.id || '');

      if (error) throw error;
      setFounders(data || []);
    } catch (error) {
      console.error('Error fetching founders:', error);
    }
  };

  const handleCreateCoffeeChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('coffee_chats')
        .insert({
          requester_id: user.id,
          requested_id: newCoffeeChat.requested_id,
          proposed_time: newCoffeeChat.proposed_time,
          meeting_type: newCoffeeChat.meeting_type,
          location_or_link: newCoffeeChat.location_or_link,
          requester_message: newCoffeeChat.requester_message,
          status: 'pending',
          duration_minutes: 30
        })
        .select()
        .single();

      if (error) throw error;

      setMyCoffeeChats(prev => [data, ...prev]);
      setNewCoffeeChat({
        requested_id: '',
        proposed_time: '',
        meeting_type: 'virtual',
        location_or_link: '',
        requester_message: ''
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating coffee chat:', error);
    }
  };

  const handleStatusUpdate = async (coffeeChatId: string, newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('coffee_chats')
        .update({ status: newStatus })
        .eq('id', coffeeChatId);

      if (error) throw error;
      
      fetchCoffeeChats(); // Refresh the list
    } catch (error) {
      console.error('Error updating coffee chat status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Coffee Chats</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Schedule Coffee Chat
          </button>
        </div>

        {/* Create Coffee Chat Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Schedule New Coffee Chat</h2>
            <form onSubmit={handleCreateCoffeeChat} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Founder
                </label>
                <select
                  value={newCoffeeChat.requested_id}
                  onChange={(e) => setNewCoffeeChat({...newCoffeeChat, requested_id: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose a founder...</option>
                  {founders.map(founder => (
                    <option key={founder.id} value={founder.id}>
                      {founder.full_name} - {founder.company_name} ({founder.location_city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proposed Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={newCoffeeChat.proposed_time}
                  onChange={(e) => setNewCoffeeChat({...newCoffeeChat, proposed_time: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Type
                </label>
                <select
                  value={newCoffeeChat.meeting_type}
                  onChange={(e) => setNewCoffeeChat({...newCoffeeChat, meeting_type: e.target.value as 'virtual' | 'in-person'})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="virtual">Virtual</option>
                  <option value="in-person">In Person</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location/Link
                </label>
                <input
                  type="text"
                  value={newCoffeeChat.location_or_link}
                  onChange={(e) => setNewCoffeeChat({...newCoffeeChat, location_or_link: e.target.value})}
                  placeholder={newCoffeeChat.meeting_type === 'virtual' ? 'Zoom/Google Meet link' : 'Coffee shop address'}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message (Optional)
                </label>
                <textarea
                  value={newCoffeeChat.requester_message}
                  onChange={(e) => setNewCoffeeChat({...newCoffeeChat, requester_message: e.target.value})}
                  placeholder="Add a personal message..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Send Request
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

        {/* Coffee Chats List */}
        <div className="space-y-6">
          {myCoffeeChats.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No coffee chats scheduled yet.</p>
              <p className="text-gray-400">Start networking by scheduling your first coffee chat!</p>
            </div>
          ) : (
            myCoffeeChats.map((chat) => (
              <div key={chat.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {chat.requester_id === user?.id ? (
                        <>Coffee chat with {chat.requested?.full_name}</>
                      ) : (
                        <>Coffee chat from {chat.requester?.full_name}</>
                      )}
                    </h3>
                    <p className="text-gray-600">
                      {chat.proposed_time && new Date(chat.proposed_time).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    chat.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    chat.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    chat.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {chat.status}
                  </span>
                </div>

                <div className="space-y-2 text-gray-600">
                  <p><strong>Type:</strong> {chat.meeting_type}</p>
                  {chat.location_or_link && (
                    <p><strong>Location:</strong> {chat.location_or_link}</p>
                  )}
                  {chat.requester_message && (
                    <p><strong>Message:</strong> {chat.requester_message}</p>
                  )}
                </div>

                {/* Action buttons for requested user */}
                {chat.requested_id === user?.id && chat.status === 'pending' && (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleStatusUpdate(chat.id, 'confirmed')}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(chat.id, 'cancelled')}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CoffeeChatsPage;
