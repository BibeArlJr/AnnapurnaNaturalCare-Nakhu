'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { apiPost, apiPut } from '@/lib/api';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function BlogForm({ mode, initialData }) {
  const router = useRouter();

  const [form, setForm] = useState({
    title: initialData?.title || '',
    excerpt: initialData?.shortDescription || initialData?.excerpt || '',
    coverImage: initialData?.coverImage || '',
    tags: initialData?.tags?.join(', ') || '',
    status: initialData?.status || 'draft',
    body: initialData?.body || '',
  });

  function update(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()),
      shortDescription: form.excerpt || form.shortDescription,
    };

    try {
      if (mode === 'create') {
        await apiPost('/blogs', payload);
      } else {
        await apiPut(`/blogs/${initialData._id}`, payload);
      }
      router.push('/admin/blogs');
    } catch (err) {
      alert(err.message || 'Failed');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <input
        className="border p-2 rounded w-full"
        placeholder="Title"
        value={form.title}
        onChange={(e) => update('title', e.target.value)}
        required
      />

      <textarea
        className="border p-2 rounded w-full h-20"
        placeholder="Short excerpt"
        value={form.excerpt}
        onChange={(e) => update('excerpt', e.target.value)}
      />

      <input
        className="border p-2 rounded w-full"
        placeholder="Cover Image URL"
        value={form.coverImage}
        onChange={(e) => update('coverImage', e.target.value)}
      />

      <input
        className="border p-2 rounded w-full"
        placeholder="Tags (comma separated)"
        value={form.tags}
        onChange={(e) => update('tags', e.target.value)}
      />

      <select
        className="border p-2 rounded w-full"
        value={form.status}
        onChange={(e) => update('status', e.target.value)}
      >
        <option value="draft">Draft</option>
        <option value="published">Published</option>
      </select>

      <div>
        <label className="block font-medium mb-2">Content</label>
        <ReactQuill theme="snow" value={form.body} onChange={(val) => update('body', val)} />
      </div>

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        {mode === 'create' ? 'Create Blog' : 'Update Blog'}
      </button>
    </form>
  );
}
