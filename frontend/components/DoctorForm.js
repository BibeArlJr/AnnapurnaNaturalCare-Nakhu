'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost, apiPut } from '@/lib/api';
import ScheduleEditor from './ScheduleEditor';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function DoctorForm({ mode, initialData }) {
  const router = useRouter();
  const fileInputRef = useRef(null);

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
    galleryImages: initialData?.galleryImages || [],
    videoUrl: initialData?.videoUrl || '',
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
  const [galleryUrlInput, setGalleryUrlInput] = useState('');
  const [preview, setPreview] = useState(initialData?.photo || '');
  const [fileName, setFileName] = useState('');
  const [imageData, setImageData] = useState('');
  const [videoPreview, setVideoPreview] = useState(initialData?.videoUrl || '');
  const [videoData, setVideoData] = useState('');

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

  function handleGalleryFiles(e) {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({
          ...prev,
          galleryImages: [...(prev.galleryImages || []), reader.result.toString()],
        }));
      };
      reader.readAsDataURL(file);
    });
  }

  function removeGalleryImage(index) {
    setForm((prev) => ({
      ...prev,
      galleryImages: (prev.galleryImages || []).filter((_, i) => i !== index),
    }));
  }

  function readFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageData(reader.result.toString());
      setPreview(reader.result.toString());
      setFileName(file.name);
    };
    reader.readAsDataURL(file);
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  }

  function handleVideoFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result.toString();
      setVideoData(dataUrl);
      setVideoPreview(URL.createObjectURL(file));
      setForm((prev) => ({ ...prev, videoUrl: '' }));
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const galleryList = Array.isArray(form.galleryImages) ? form.galleryImages : [];
    const galleryImages = galleryList.filter((img) => img && !img.startsWith('data:'));
    const galleryImageData = galleryList.filter((img) => img && img.startsWith('data:'));

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
      galleryImages,
      galleryImageData,
      videoUrl: form.videoUrl?.trim(),
      videoData: videoData || undefined,
      imageData: imageData || undefined,
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

      <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70">
        <div className="border-b border-slate-800 px-4 py-3">
          <p className="text-sm font-semibold text-white">Media</p>
          <p className="text-xs text-slate-400">Styled like the patient review uploader for gallery & video.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
          <MediaCard title="Profile photo" helper="Drop or click to upload the main headshot.">
            <div
              className="border-2 border-dashed border-slate-700 bg-slate-900/60 rounded-xl p-4 flex flex-col gap-3 items-center justify-center text-slate-300 cursor-pointer hover:border-teal-500 transition"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="text-center space-y-1">
                <p className="font-medium">Drop an image here or click to upload</p>
                <p className="text-xs text-slate-500">Recommended: square, under 5MB. JPG or PNG.</p>
              </div>
              {fileName && <p className="text-xs text-teal-300">Selected: {fileName}</p>}
            </div>
            {preview || form.photo ? (
              <div className="w-full grid grid-cols-1 md:grid-cols-[140px_1fr] gap-3 items-center">
                <img
                  src={preview || form.photo}
                  alt="Preview"
                  className="w-full max-w-[140px] h-28 object-cover rounded-lg border border-slate-700"
                />
                <p className="text-xs text-slate-400">This preview will be uploaded to Cloudinary and saved.</p>
              </div>
            ) : null}
          </MediaCard>

          <MediaCard title="Gallery images" helper="Upload or paste up to 10 images.">
            <UploadBox accept="image/png,image/jpeg,image/webp" multiple onChange={handleGalleryFiles} label="Upload images" />
            <div className="flex flex-wrap gap-2 mt-2">
              {(form.galleryImages || []).map((img, idx) => (
                <Thumb key={img + idx} src={img} onRemove={() => removeGalleryImage(idx)} />
              ))}
            </div>
            <p className="text-[11px] text-slate-500">Accepted: JPG/PNG/WEBP. Max 10 images.</p>
          </MediaCard>

          <MediaCard title="Profile video" helper="Paste a YouTube/Vimeo link or direct video URL.">
            <input
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-white text-sm placeholder-slate-500"
              placeholder="Video URL (optional)"
              value={form.videoUrl}
              onChange={(e) => update('videoUrl', e.target.value)}
            />
            <UploadBox accept="video/mp4,video/quicktime,video/webm" onChange={handleVideoFileChange} label="Upload video file" />
            {videoPreview || form.videoUrl ? (
              <div className="mt-2 overflow-hidden rounded-lg border border-slate-700 bg-black">
                <iframe
                  src={videoPreview || form.videoUrl}
                  className="w-full aspect-video"
                  title="Doctor video preview"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : null}
          </MediaCard>
        </div>
      </div>

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

function MediaCard({ title, helper, children }) {
  return (
    <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        {helper ? <p className="text-xs text-slate-400">{helper}</p> : null}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function UploadBox({ accept, multiple, onChange, label }) {
  return (
    <label className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 bg-slate-900/60 px-4 py-5 text-slate-300 cursor-pointer hover:border-teal-500 hover:bg-slate-900 transition">
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          if (!onChange) return;
          onChange(e);
        }}
      />
      <span className="text-xs text-slate-400">{label}</span>
      <span className="text-[11px] text-slate-500">{accept || ''}</span>
    </label>
  );
}

function Thumb({ src, onRemove }) {
  return (
    <div className="relative h-20 w-20 rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
      <img src={src} className="h-full w-full object-cover" alt="Gallery" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 bg-black/70 text-white rounded-full text-xs px-1"
      >
        ×
      </button>
    </div>
  );
}
