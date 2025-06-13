'use client';

export default function ClosedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Applications Closed
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've reached our capacity of 250 verified founders.
          </p>
          <p className="mt-4 text-sm text-gray-600">
            Join our waitlist to be notified when we expand.
          </p>
        </div>
        <div className="mt-8">
          <a
            href="/"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
