'use client';

import { useState } from 'react';
import { apiPost } from '@/lib/api';

export default function AppointmentForm({ doctorId, date, time }) {
  const [form, setForm] = useState({
    patientName: '',
    patientEmail: '',
    patientPhone: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      await apiPost('/appointments/book', {
        doctorId,
        date,
        time,
        ...form,
      });
      setMessage('Appointment booked successfully!');
    } catch (err) {
      setMessage(err.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {['patientName', 'patientEmail', 'patientPhone'].map((field) => (
        <input
          key={field}
          className="border p-2 rounded w-full"
          placeholder={field}
          value={form[field]}
          onChange={(e) => setForm({ ...form, [field]: e.target.value })}
        />
      ))}

      <button
        onClick={submit}
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
        disabled={loading}
      >
        {loading ? 'Booking...' : 'Book Appointment'}
      </button>

      {message && <div className="text-center pt-2">{message}</div>}
    </div>
  );
}
