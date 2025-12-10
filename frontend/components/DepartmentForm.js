'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiPost, apiPut } from '@/lib/api';

export default function DepartmentForm({ mode, initialData }) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    image: initialData?.heroImage || initialData?.image || '',
  });

  function update(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      if (mode === 'create') {
        await apiPost('/departments', { ...form, heroImage: form.image });
      } else {
        await apiPut(`/departments/${initialData._id}`, { ...form, heroImage: form.image });
      }

      router.push('/admin/departments');
    } catch (err) {
      alert(err.message || 'Failed');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      <input
        type="text"
        placeholder="Department Name"
        value={form.name}
        onChange={(e) => update('name', e.target.value)}
        className="border p-2 rounded w-full"
        required
      />

      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => update('description', e.target.value)}
        className="border p-2 rounded w-full h-24"
      />

      <input
        type="text"
        placeholder="Image URL (optional)"
        value={form.image}
        onChange={(e) => update('image', e.target.value)}
        className="border p-2 rounded w-full"
      />

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        {mode === 'create' ? 'Create' : 'Update'}
      </button>
    </form>
  );
}
