'use client';

import { useState, useEffect } from 'react';
import { Contact, Introduction } from '../types';
import { createIntroduction } from '../api';

export default function IntroBuilder() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contact1, setContact1] = useState<string>('');
  const [contact2, setContact2] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch('/api/contacts');
        const data = await response.json();
        setContacts(data);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };

    fetchContacts();
  }, []);

  const generateDefaultMessage = (contact1: Contact, contact2: Contact) => {
    return `Hi ${contact1.name},

I'd like to introduce you to ${contact2.name}. I think you two would have a great conversation about [shared interest/opportunity].

${contact2.name}, ${contact1.name} is [brief description].
${contact1.name}, ${contact2.name} is [brief description].

I'll leave you two to connect!

Best,
[Your name]`;
  };

  const handleContactSelect = (contactId: string, position: 1 | 2) => {
    if (position === 1) {
      setContact1(contactId);
    } else {
      setContact2(contactId);
    }

    // Generate message when both contacts are selected
    if (position === 2 && contact1 || position === 1 && contact2) {
      const selectedContact1 = contacts.find(c => c.id === (position === 1 ? contactId : contact1));
      const selectedContact2 = contacts.find(c => c.id === (position === 2 ? contactId : contact2));
      if (selectedContact1 && selectedContact2) {
        setMessage(generateDefaultMessage(selectedContact1, selectedContact2));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact1 || !contact2 || !message) return;

    try {
      await createIntroduction({
        contact1_id: contact1,
        contact2_id: contact2,
        message,
        status: 'pending'
      });
      // Reset form
      setContact1('');
      setContact2('');
      setMessage('');
    } catch (error) {
      console.error('Error creating introduction:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Create an Introduction</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contact 1
            </label>
            <select
              value={contact1}
              onChange={(e) => handleContactSelect(e.target.value, 1)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select contact...</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contact 2
            </label>
            <select
              value={contact2}
              onChange={(e) => handleContactSelect(e.target.value, 2)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select contact...</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Introduction Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={10}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Write your introduction message..."
          />
        </div>

        <button
          type="submit"
          disabled={!contact1 || !contact2 || !message}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          Send Introduction
        </button>
      </form>
    </div>
  );
} 