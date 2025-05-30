'use client';

import { useState, useEffect } from 'react';
import { withAuth } from '@/components/withAuth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';

type Contact = Database['public']['Tables']['contacts']['Row'];

const ContactsPage = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({
    contact_name: '',
    email: '',
    relationship_type: '',
    notes: '',
    birthdate: '',
    reminder_frequency: 'monthly' as 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  });

  const supabase = createClientComponentClient<Database>();

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts');
      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const addContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('contacts')
        .insert([{
          ...newContact,
          owner_id: session.user.id,
          birthdate: newContact.birthdate || null,
        }]);

      if (error) throw error;

      setNewContact({
        contact_name: '',
        email: '',
        relationship_type: '',
        notes: '',
        birthdate: '',
        reminder_frequency: 'monthly'
      });
      setShowAddForm(false);
      fetchContacts();
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };

  const deleteContact = async (contactId: string) => {
    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchContacts();
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
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
                  onChange={(e) => setNewContact({...newContact, reminder_frequency: e.target.value as any})}
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
