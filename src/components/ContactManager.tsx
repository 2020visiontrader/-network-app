'use client';

import { useState, useEffect } from 'react';
import { Contact, Interaction } from '../types';
import { addContact, updateContact, deleteContact, logInteraction } from '../api';

export default function ContactManager() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInteractionModal, setShowInteractionModal] = useState(false);

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts');
      const data = await response.json();
      setContacts(data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleAddContact = async (contact: Omit<Contact, 'id'>) => {
    try {
      await addContact(contact);
      fetchContacts();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };

  const handleUpdateContact = async (contact: Contact) => {
    try {
      await updateContact(contact);
      fetchContacts();
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      await deleteContact(contactId);
      fetchContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const handleLogInteraction = async (interaction: Omit<Interaction, 'id'>) => {
    try {
      await logInteraction(interaction);
      fetchContacts();
      setShowInteractionModal(false);
    } catch (error) {
      console.error('Error logging interaction:', error);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">My Contacts</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Contact
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map((contact) => (
          <div key={contact.id} className="border p-4 rounded-lg shadow">
            <h3 className="text-xl font-semibold">{contact.name}</h3>
            <p className="text-gray-600">{contact.relationship_type}</p>
            <p className="text-sm text-gray-500">
              Reminder: {contact.reminder_frequency}
            </p>
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => {
                  setSelectedContact(contact);
                  setShowEditModal(true);
                }}
                className="text-blue-500 hover:text-blue-700"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  setSelectedContact(contact);
                  setShowInteractionModal(true);
                }}
                className="text-green-500 hover:text-green-700"
              >
                Log Interaction
              </button>
              <button
                onClick={() => handleDeleteContact(contact.id)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add modals for add/edit/interaction forms */}
    </div>
  );
} 