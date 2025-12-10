'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost, apiPut } from '@/lib/api';
import ScheduleEditor from './ScheduleEditor';

export default function DoctorForm({ mode, initialData }) {
  const router = useRouter();

  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    name: initialData?.name || '',
    title: initialData?.title || '',
    departmentId: initialData?.departmentId || '',
    specialties: initialData?.specialties?.join(', ') || '',
    experienceYears: initialData?.experienceYears || 0,
    bio: initialData?.bio || '',
    photo: initialData?.photo || '',
    schedule:
      initialData?.schedule ||
      [
        { day: 'monday', slots: [] },
        { day: 'tuesday', slots: [] },
        { day: 'wednesday', slots: [] },
        { day: 'thursday', slots: [] },
        { day: 'friday', slots: [] },
        { day: 'saturday', slots: [] },
        { day: 'sunday', slots: [] },
      ],
  });

  useEffect(() => {
    async function loadDepartments() {
      try {
        const res = await apiGet('/departments');
        setDepartments(res.data || []);
      } catch (err) {
        setDepartments([]);
      }
    }
    loadDepartments();
  }, []);

  function update(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      ...form,
      specialties: form.specialties
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      if (mode === 'create') {
        await apiPost('/doctors', payload);
      } else {
        await apiPut(`/doctors/${initialData._id}`, payload);
      }

      router.push('/admin/doctors');
    } catch (err) {
      alert(err.message || 'Failed');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <input
        className="border p-2 rounded w-full"
        placeholder="Doctor Name"
        value={form.name}
        onChange={(e) => update('name', e.target.value)}
        required
      />

      <input
        className="border p-2 rounded w-full"
        placeholder="Title (e.g., Senior Cardiologist)"
        value={form.title}
        onChange={(e) => update('title', e.target.value)}
        required
      />

      <select
        className="border p-2 rounded w-full"
        value={form.departmentId}
        onChange={(e) => update('departmentId', e.target.value)}
        required
      >
        <option value="">Select Department</option>
        {departments.map((d) => (
          <option key={d._id} value={d._id}>
            {d.name}
          </option>
        ))}
      </select>

      <input
        className="border p-2 rounded w-full"
        placeholder="Specialties (comma separated)"
        value={form.specialties}
        onChange={(e) => update('specialties', e.target.value)}
      />

      <input
        type="number"
        className="border p-2 rounded w-full"
        placeholder="Experience (years)"
        value={form.experienceYears}
        onChange={(e) => update('experienceYears', e.target.value)}
      />

      <textarea
        className="border p-2 rounded w-full h-24"
        placeholder="Doctor Bio"
        value={form.bio}
        onChange={(e) => update('bio', e.target.value)}
      />

      <input
        className="border p-2 rounded w-full"
        placeholder="Photo URL"
        value={form.photo}
        onChange={(e) => update('photo', e.target.value)}
      />

      <ScheduleEditor schedule={form.schedule} onChange={(s) => update('schedule', s)} />

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        {mode === 'create' ? 'Create Doctor' : 'Update Doctor'}
      </button>
    </form>
  );
}
