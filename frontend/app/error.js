'use client';

export default function Error({ reset }) {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-red-600 text-xl font-semibold">Something went wrong.</h2>
      <p className="text-gray-700">Please try again or reload the page.</p>
      <button
        onClick={() => reset?.()}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Retry
      </button>
    </div>
  );
}
