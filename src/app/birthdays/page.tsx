'use client';

import { withAuth } from '@/components/withAuth';
import BirthdayReminders from '@/components/BirthdayReminders';

const BirthdayRemindersPage = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Birthday Reminders</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">🎂 Upcoming Birthdays</h2>
        <BirthdayReminders />
      </div>
    </div>
  );
};

export default withAuth(BirthdayRemindersPage);
