'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost, apiPut } from '@/lib/api';

export default function GalleryForm({ mode, initialData }) {
  const router = useRouter();

  const [form, setForm] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    type: initialData?.type || 'image',
    url: initialData?.url || '',
    tags: initialData?.tags?.join(', ') || '',
    isFeatured: initialData?.isFeatured || false,
  });

  function update(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()),
    };

    try {
      if (mode === 'create') {
        await apiPost('/gallery', payload);
      } else {
        await apiPut(`/gallery/${initialData._id}`, payload);
      }
      router.push('/admin/gallery');
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

      <select
        className="border p-2 rounded w-full"
        value={form.type}
        onChange={(e) => update('type', e.target.value)}
      >
        <option value="image">Image</option>
        <option value="video">Video</option>
      </select>

      <input
        className="border p-2 rounded w-full"
        placeholder="Image/Video URL"
        value={form.url}
        onChange={(e) => update('url', e.target.value)}
        required
      />

      <input
        className="border p-2 rounded w-full"
        placeholder="Tags (comma separated)"
        value={form.tags}
        onChange={(e) => update('tags', e.target.value)}
      />

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.isFeatured}
          onChange={(e) => update('isFeatured', e.target.checked)}
        />
        Featured
      </label>

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        {mode === 'create' ? 'Add Media' : 'Update Media'}
      </button>
    </form>
  );
}
