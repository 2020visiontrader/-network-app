'use client';

import { useState, useEffect } from 'react';
import { withAuth } from '@/components/withAuth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type Founder = any;
type Connection = any;

interface NewContact {
  contact_name?: string;
  email?: string;
  company?: string;
  role?: string;
  reminder_frequency?: 'weekly' | 'monthly' | 'quarterly';
  notes?: string;
  relationship_type?: string;
  birthdate?: string;
}

const ContactsPage = () => {
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFounderId, setCurrentFounderId] = useState<string | null>(null);
  const [newContact, setNewContact] = useState<NewContact>({});
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  const [contacts, setContacts] = useState<any[]>([]);

  const fetchContacts = async () => {
    console.log("fetchContacts called");
  };

  const supabase = createClientComponentClient();
  const fetchConnections = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      setCurrentFounderId(session.user.id);

      const { data, error } = await supabase
        .from('connections')
        .select(`
          *,
          founder_a:founders!founder_a_id(*),
          founder_b:founders!founder_b_id(*)
        `)
        .or(`founder_a_id.eq.${session.user.id},founder_b_id.eq.${session.user.id}`)
        .eq('status', 'connected')
        .order('connected_at', { ascending: false });

      if (error) throw error;
      setConnections(data || []);
    } catch (error) {
      console.error('Error fetching founder connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const addContact = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("addContact called");
  };

  const deleteContact = async (contactId: string) => {
    console.log("deleteContact called");
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Contacts</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
        >
          Add Contact
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Contact</h2>
          <form onSubmit={addContact} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name *
                  <input
                    type="text"
                    value={newContact.contact_name}
                    onChange={(e) => setNewContact({...newContact, contact_name: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    required
                  />
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                  <input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Relationship
                  <input
                    type="text"
                    value={newContact.relationship_type}
                    onChange={(e) => setNewContact({...newContact, relationship_type: e.target.value})}
                    placeholder="Friend, Colleague, Family..."
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Birthday
                  <input
                    type="date"
                    value={newContact.birthdate}
                    onChange={(e) => setNewContact({...newContact, birthdate: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Reminder Frequency
                <select
                  value={newContact.reminder_frequency}
                  onChange={(e) => setNewContact({...newContact, reminder_frequency: e.target.value as 'weekly' | 'monthly' | 'quarterly'})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Notes
                <textarea
                  value={newContact.notes}
                  onChange={(e) => setNewContact({...newContact, notes: e.target.value})}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </label>
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
              >
                Add Contact
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {contacts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No contacts yet</p>
            <p className="text-gray-400">Add your first contact to get started!</p>
          </div>
        ) : (
          contacts.map((contact) => (
            <div key={contact.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{contact.contact_name}</h3>
                  {contact.email && (
                    <p className="text-gray-600">{contact.email}</p>
                  )}
                  {contact.relationship_type && (
                    <p className="text-sm text-gray-500">{contact.relationship_type}</p>
                  )}
                  {contact.birthdate && (
                    <p className="text-sm text-gray-500">
                      Birthday: {new Date(contact.birthdate).toLocaleDateString()}
                    </p>
                  )}
                  {contact.notes && (
                    <p className="text-gray-700 mt-2">{contact.notes}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Reminder: {contact.reminder_frequency}
                  </p>
                </div>
                <button
                  onClick={() => deleteContact(contact.id)}
                  className="text-red-600 hover:text-red-800 ml-4"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default withAuth(ContactsPage);
