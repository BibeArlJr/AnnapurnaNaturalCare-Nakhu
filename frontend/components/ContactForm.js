'use client';

import { useState } from 'react';
import { apiPost } from '@/lib/api';

export default function ContactForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [status, setStatus] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('');

    try {
      await apiPost('/contact', form);
      setStatus('Message sent successfully!');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setStatus(err.message || 'Failed to send message');
    }
  }

  function updateField(field, value) {
    setForm({ ...form, [field]: value });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Name"
        value={form.name}
        onChange={(e) => updateField('name', e.target.value)}
        className="border p-2 rounded w-full"
        required
      />

      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => updateField('email', e.target.value)}
        className="border p-2 rounded w-full"
        required
      />

      <input
        type="text"
        placeholder="Phone"
        value={form.phone}
        onChange={(e) => updateField('phone', e.target.value)}
        className="border p-2 rounded w-full"
      />

      <textarea
        placeholder="Message"
        value={form.message}
        onChange={(e) => updateField('message', e.target.value)}
        className="border p-2 rounded w-full h-32"
        required
      />

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
      >
        Send Message
      </button>

      {status && <p className="text-center pt-2 text-gray-700">{status}</p>}
    </form>
  );
}
