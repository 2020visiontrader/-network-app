import { notFound } from 'next/navigation';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Events
        </h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <p>Events content loading...</p>
        </div>
      </div>
    </div>
  );
}
