'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';

type BirthdayReminder = Database['public']['Tables']['birthday_reminders']['Row'];
type Contact = Database['public']['Tables']['contacts']['Row'];

type RemindersWithContact = BirthdayReminder & {
  contact: Contact;
};

interface BirthdayRemindersProps {
  limit?: number;
  showActions?: boolean;
}

const BirthdayReminders = ({ limit, showActions = true }: BirthdayRemindersProps) => {
  const [reminders, setReminders] = useState<RemindersWithContact[]>([]);
  const supabase = createClientComponentClient<Database>();

  const getUpcomingBirthdays = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from('birthday_reminders')
      .select('*, contact:contacts(*)')
      .gte('reminder_date', new Date().toISOString())
      .order('reminder_date', { ascending: true })
      .limit(limit || 100);

    if (error) {
      console.error('Error fetching birthday reminders:', error);
      return;
    }

    setReminders(data);
  };

  const acknowledgeReminder = async (reminderId: string) => {
    const { error } = await supabase
      .from('birthday_reminders')
      .update({ reminder_sent: true })
      .eq('id', reminderId);

    if (error) {
      console.error('Error acknowledging reminder:', error);
      return;
    }

    getUpcomingBirthdays();
  };

  useEffect(() => {
    getUpcomingBirthdays();
  }, []);

  return (
    <div className="space-y-4">
      {reminders.map((reminder) => (
        <div
          key={reminder.id}
          className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
        >
          <div>
            <h3 className="font-medium">{reminder.contact.contact_name}</h3>
            <p className="text-sm text-gray-500">
              Birthday: {new Date(reminder.reminder_date).toLocaleDateString()}
            </p>
          </div>
          {showActions && (
            <div className="flex space-x-2">
              <button
                onClick={() => window.open('mailto:' + reminder.contact.email)}
                className="px-3 py-1 text-sm bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                Send Message
              </button>
              <button
                onClick={() => acknowledgeReminder(reminder.id)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Mark Done
              </button>
            </div>
          )}
        </div>
      ))}
      {reminders.length === 0 && (
        <p className="text-gray-500 text-center py-4">No upcoming birthdays</p>
      )}
    </div>
  );
};

export default BirthdayReminders;
