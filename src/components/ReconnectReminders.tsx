'use client';

import { useState, useEffect } from 'react';
import { Contact } from '../types';

export default function ReconnectReminders() {
  const [dueContacts, setDueContacts] = useState<Contact[]>([]);

  useEffect(() => {
    const fetchDueContacts = async () => {
      try {
        const response = await fetch('/api/contacts/due-for-reconnect');
        const data = await response.json();
        setDueContacts(data);
      } catch (error) {
        console.error('Error fetching due contacts:', error);
      }
    };

    fetchDueContacts();
  }, []);

  const handleLogInteraction = async (contactId: string) => {
    try {
      await fetch('/api/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact_id: contactId,
          type: 'other',
          date: new Date().toISOString(),
        }),
      });

      // Refresh the list
      const response = await fetch('/api/contacts/due-for-reconnect');
      const data = await response.json();
      setDueContacts(data);
    } catch (error) {
      console.error('Error logging interaction:', error);
    }
  };

  if (dueContacts.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Reconnect Reminders</h2>
        <p className="text-gray-600">You're all caught up! No reconnections due.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Reconnect Reminders</h2>
      <div className="space-y-4">
        {dueContacts.map((contact) => (
          <div
            key={contact.id}
            className="flex items-center justify-between border-b pb-4 last:border-0"
          >
            <div>
              <h3 className="font-medium">{contact.name}</h3>
              <p className="text-sm text-gray-600">
                Last interaction:{' '}
                {contact.last_interaction_date
                  ? new Date(contact.last_interaction_date).toLocaleDateString()
                  : 'Never'}
              </p>
            </div>
            <button
              onClick={() => handleLogInteraction(contact.id)}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              Log Interaction
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 