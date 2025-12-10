'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost, apiPut } from '@/lib/api';

export default function PackageForm({ mode, initialData }) {
  const router = useRouter();

  const [form, setForm] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    images: initialData?.images?.join(', ') || '',
    featured: initialData?.featured || initialData?.isFeatured || false,
  });

  function update(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      title: form.title,
      description: form.description,
      price: form.price,
      images: form.images
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean),
      featured: form.featured,
    };

    try {
      if (mode === 'create') {
        await apiPost('/packages', payload);
      } else {
        await apiPut(`/packages/${initialData._id}`, payload);
      }

      router.push('/admin/packages');
    } catch (err) {
      alert(err.message || 'Failed');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      <input
        className="border p-2 rounded w-full"
        placeholder="Title"
        value={form.title}
        onChange={(e) => update('title', e.target.value)}
        required
      />

      <textarea
        className="border p-2 rounded w-full h-20"
        placeholder="Description"
        value={form.description}
        onChange={(e) => update('description', e.target.value)}
      />

      <input
        type="number"
        className="border p-2 rounded w-full"
        placeholder="Price"
        value={form.price}
        onChange={(e) => update('price', e.target.value)}
      />

      <input
        className="border p-2 rounded w-full"
        placeholder="Image URLs (comma separated)"
        value={form.images}
        onChange={(e) => update('images', e.target.value)}
      />

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.featured}
          onChange={(e) => update('featured', e.target.checked)}
        />
        Featured
      </label>

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        {mode === 'create' ? 'Add Package' : 'Update Package'}
      </button>
    </form>
  );
}
