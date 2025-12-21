'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost, apiPut } from '@/lib/api';
import ScheduleEditor from './ScheduleEditor';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function DoctorForm({ mode, initialData }) {
  const router = useRouter();

  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    name: initialData?.name || '',
    title: initialData?.title || '',
    departmentId: initialData?.departmentId || '',
    degree: initialData?.degree || '',
    specialties: initialData?.specialties?.join(', ') || '',
    experienceYears: initialData?.experienceYears || 0,
    description: initialData?.description || initialData?.bio || '',
    photo: initialData?.photo || '',
    medicalQualifications: initialData?.medicalQualifications || [],
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

  function updateQualification(index, field, value) {
    const next = [...form.medicalQualifications];
    next[index] = { ...next[index], [field]: value };
    setForm({ ...form, medicalQualifications: next });
  }

  function addQualification() {
    setForm((prev) => ({ ...prev, medicalQualifications: [...(prev.medicalQualifications || []), { degree: '', institution: '', year: '' }] }));
  }

  function removeQualification(index) {
    setForm((prev) => ({
      ...prev,
      medicalQualifications: prev.medicalQualifications.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      ...form,
    specialties: form.specialties
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    description: form.description,
    bio: form.description,
    degree: form.degree,
    medicalQualifications: (form.medicalQualifications || []).filter((q) => q && q.degree),
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

      <input
        className="border p-2 rounded w-full"
        placeholder="Degree (e.g., MD, MBBS)"
        value={form.degree}
        onChange={(e) => update('degree', e.target.value)}
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

      <div className="space-y-2">
        <p className="text-sm font-medium text-neutral-700">Doctor Description</p>
        <ReactQuill
          theme="snow"
          value={form.description}
          onChange={(value) => update('description', value)}
          placeholder="Add rich details about the doctor"
          modules={{
            toolbar: [
              [{ header: [1, 2, 3, false] }],
              ['bold', 'italic', 'underline'],
              [{ list: 'ordered' }, { list: 'bullet' }],
              ['link'],
              ['clean'],
            ],
          }}
        />
      </div>

      <input
        className="border p-2 rounded w-full"
        placeholder="Photo URL"
        value={form.photo}
        onChange={(e) => update('photo', e.target.value)}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-neutral-700">Medical Qualifications</p>
          <button
            type="button"
            onClick={addQualification}
            className="px-3 py-1 text-sm rounded bg-neutral-200 hover:bg-neutral-300 transition"
          >
            Add
          </button>
        </div>
        <div className="space-y-3">
          {(form.medicalQualifications || []).map((q, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
              <div className="flex flex-col">
                <label className="text-xs text-neutral-600">Degree (required)</label>
                <input
                  className="border p-2 rounded w-full"
                  value={q.degree}
                  onChange={(e) => updateQualification(idx, 'degree', e.target.value)}
                  placeholder="e.g., MD, MBBS"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-neutral-600">Institution</label>
                <input
                  className="border p-2 rounded w-full"
                  value={q.institution || ''}
                  onChange={(e) => updateQualification(idx, 'institution', e.target.value)}
                  placeholder="e.g., Johns Hopkins"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-neutral-600">Year</label>
                <div className="flex gap-2">
                  <input
                    className="border p-2 rounded w-full"
                    value={q.year || ''}
                    onChange={(e) => updateQualification(idx, 'year', e.target.value)}
                    placeholder="e.g., 2015"
                  />
                  <button
                    type="button"
                    onClick={() => removeQualification(idx)}
                    className="px-3 py-2 text-sm rounded bg-rose-100 text-rose-700 hover:bg-rose-200 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ScheduleEditor schedule={form.schedule} onChange={(s) => update('schedule', s)} />

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        {mode === 'create' ? 'Create Doctor' : 'Update Doctor'}
      </button>
    </form>
  );
}
