'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost, apiPut } from '@/lib/api';

export default function PackageForm({ mode, initialData }) {
  const router = useRouter();

  const [form, setForm] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    images: initialData?.images?.join(', ') || '',
    featured: initialData?.featured || initialData?.isFeatured || false,
    departments: initialData?.departments?.map((d) => d?._id || d) || [],
  });
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    async function loadDepartments() {
      try {
        const res = await apiGet('/departments');
        setDepartments(res?.data || res || []);
      } catch (err) {
        console.error('Department fetch error', err);
      }
    }
    loadDepartments();
  }, []);

  function update(field, value) {
    setForm({ ...form, [field]: value });
  }

  function toggleDepartment(id) {
    setForm((prev) => {
      const exists = prev.departments.includes(id);
      return { ...prev, departments: exists ? prev.departments.filter((d) => d !== id) : [...prev.departments, id] };
    });
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
      departments: form.departments,
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

      <div className="border p-3 rounded space-y-2">
        <p className="text-sm font-medium">Departments</p>
        <div className="flex flex-wrap gap-2">
          {departments.map((d) => {
            const active = form.departments.includes(d._id);
            return (
              <button
                type="button"
                key={d._id}
                onClick={() => toggleDepartment(d._id)}
                className={`px-3 py-1 rounded-full text-sm border ${
                  active ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-gray-100 border-gray-300 text-gray-700'
                }`}
              >
                {d.name}
              </button>
            );
          })}
        </div>
      </div>

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
