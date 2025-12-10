'use client';

export default function Error({ reset }) {
  return (
    <div className="p-6 space-y-3">
      <p className="text-red-600 font-semibold">Failed to load blog content.</p>
      <button
        onClick={() => reset?.()}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Retry
      </button>
    </div>
  );
}
