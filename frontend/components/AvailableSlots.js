'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api';

export default function AvailableSlots({ selectedDoctor }) {
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState('');

  async function fetchSlots(d) {
    if (!d) return;
    try {
      const res = await apiGet(`/doctors/${selectedDoctor._id}/availability?date=${d}`);
      setSlots(res.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load availability');
      setSlots([]);
    }
  }

  return (
    <div className="space-y-4">
      <label className="block font-medium" htmlFor="date-input">
        Select Date
      </label>
      <input
        id="date-input"
        type="date"
        className="border p-2 rounded"
        value={date}
        onChange={(e) => {
          const nextDate = e.target.value;
          setDate(nextDate);
          fetchSlots(nextDate);
        }}
      />

      {error && <div className="text-red-600">{error}</div>}

      <div className="grid grid-cols-3 gap-2">
        {slots.map((slot, i) => (
          <Link
            key={i}
            href={`/appointments/book?doctor=${selectedDoctor.slug}&date=${date}&time=${slot}`}
            className="border p-2 rounded text-center hover:bg-blue-100"
          >
            {slot}
          </Link>
        ))}
      </div>
    </div>
  );
}
