'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';

type Founder = any;

type CoffeeChat = Omit<Database['public']['Tables']['coffee_chats']['Row'], 'created_at'> & {
  requester: any;
  requested: any;
  location_or_link: string; // Add this line if 'location_or_link' is not present in the Row type
  meeting_type: 'virtual' | 'in-person'; // Add this line to fix the error
  requester_message: string; // Add this line to fix the error
  proposed_time: string; // Add this line to fix the error
};

const CoffeeChatsPage = () => {
  const [myCoffeeChats, setMyCoffeeChats] = useState<CoffeeChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCoffeeChat, setNewCoffeeChat] = useState({
    requested_id: '',
    proposed_time: '',
    meeting_type: 'virtual' as 'virtual' | 'in-person',
    location_or_link: '',
    requester_message: ''
  });

  const supabase = createClientComponentClient<Database>();

  const fetchCoffeeChats = async () => {
    try {
      const { data: chats, error } = await supabase
        .from('coffee_chats')
        .select(`
          *,
          requester:founders!requester_id(id, full_name, email),
          requested:founders!requested_id(id, full_name, email)
        `);

      if (error) throw error;
      setMyCoffeeChats(chats || []);
    } catch (error) {
      console.error('Error fetching coffee chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCoffeeChat = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { error } = await supabase.from('coffee_chats').insert({
        ...newCoffeeChat,
        requester_id: user.user.id,
        status: 'pending'
      });

      if (error) throw error;

      setShowCreateForm(false);
      setNewCoffeeChat({
        requested_id: '',
        proposed_time: '',
        meeting_type: 'virtual',
        location_or_link: '',
        requester_message: ''
      });
      
      await fetchCoffeeChats();
    } catch (error) {
      console.error('Error creating coffee chat:', error);
    }
  };

  const deleteCoffeeChat = async (id: string) => {
    try {
      const { error } = await supabase
        .from('coffee_chats')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchCoffeeChats();
    } catch (error) {
      console.error('Error deleting coffee chat:', error);
    }
  };

  useEffect(() => {
    fetchCoffeeChats();

    const channel = supabase
      .channel('public:coffee_chats')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'coffee_chats' },
        async (payload) => {
          console.log('Change received!', payload);
          fetchCoffeeChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Coffee Chats</h1>
      
      <button
        onClick={() => setShowCreateForm(!showCreateForm)}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        {showCreateForm ? 'Cancel' : 'Schedule New Coffee Chat'}
      </button>

      {showCreateForm && (
        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Schedule New Coffee Chat</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Founder ID
              </label>
              <input
                type="text"
                value={newCoffeeChat.requested_id}
                onChange={(e) => setNewCoffeeChat({
                  ...newCoffeeChat,
                  requested_id: e.target.value
                })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Proposed Time
              </label>
              <input
                type="datetime-local"
                value={newCoffeeChat.proposed_time}
                onChange={(e) => setNewCoffeeChat({
                  ...newCoffeeChat,
                  proposed_time: e.target.value
                })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Meeting Type
              </label>
              <select
                value={newCoffeeChat.meeting_type}
                onChange={(e) => setNewCoffeeChat({
                  ...newCoffeeChat,
                  meeting_type: e.target.value as 'virtual' | 'in-person'
                })}
                className="w-full p-2 border rounded"
              >
                <option value="virtual">Virtual</option>
                <option value="in-person">In Person</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Location or Link
              </label>
              <input
                type="text"
                value={newCoffeeChat.location_or_link}
                onChange={(e) => setNewCoffeeChat({
                  ...newCoffeeChat,
                  location_or_link: e.target.value
                })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Message
              </label>
              <textarea
                value={newCoffeeChat.requester_message}
                onChange={(e) => setNewCoffeeChat({
                  ...newCoffeeChat,
                  requester_message: e.target.value
                })}
                className="w-full p-2 border rounded"
              />
            </div>
            <button
              onClick={createCoffeeChat}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Schedule Chat
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {myCoffeeChats.map((chat) => (
          <div key={chat.id} className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">
                  Chat with {chat.requester.full_name}
                </h3>
                <p className="text-sm text-gray-600">
                  {new Date(chat.proposed_time).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  {chat.meeting_type} - {chat.location_or_link}
                </p>
                {chat.requester_message && (
                  <p className="mt-2">{chat.requester_message}</p>
                )}
              </div>
              <button
                onClick={() => deleteCoffeeChat(chat.id)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CoffeeChatsPage;
