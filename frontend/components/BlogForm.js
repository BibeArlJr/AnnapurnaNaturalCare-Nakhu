'use client';

import { useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { apiPost, apiPut } from '@/lib/api';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
const CATEGORY_OPTIONS = ['Wellness', 'Therapy', 'Rehab', 'Lifestyle', 'Ayurveda', 'Yoga'];

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function BlogForm({ mode, initialData }) {
  const router = useRouter();
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const initialCategory =
    initialData?.category || initialData?.categoryId?.name || initialData?.categoryId || '';
  const [form, setForm] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    category: initialCategory,
    shortDescription: initialData?.shortDescription || '',
    content: initialData?.content || initialData?.body || '',
  });
  const [existingImages, setExistingImages] = useState(initialData?.images || []);
  const [existingVideos, setExistingVideos] = useState(initialData?.videos || []);
  const [youtubeLinks, setYoutubeLinks] = useState(initialData?.youtubeLinks || []);
  const [removeExistingImages, setRemoveExistingImages] = useState([]);
  const [removeExistingVideos, setRemoveExistingVideos] = useState([]);
  const [removeExistingYoutubeLinks, setRemoveExistingYoutubeLinks] = useState([]);
  const [imageUploads, setImageUploads] = useState([]);
  const [videoUploads, setVideoUploads] = useState([]);
  const [youtubeInput, setYoutubeInput] = useState('');

  const hasInitialYoutube = useMemo(() => new Set(initialData?.youtubeLinks || []), [initialData]);
  const hasInitialImages = useMemo(() => new Set(initialData?.images || []), [initialData]);
  const hasInitialVideos = useMemo(() => new Set(initialData?.videos || []), [initialData]);

  function update(field, value) {
    setForm({ ...form, [field]: value });
  }

  function handleTitleChange(value) {
    setForm((prev) => ({ ...prev, title: value, slug: prev.slug || slugify(value) }));
  }

  function handleImageSelect(e) {
    const files = Array.from(e.target.files || []);
    const mapped = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setImageUploads((prev) => [...prev, ...mapped]);
  }

  function handleVideoSelect(e) {
    const files = Array.from(e.target.files || []);
    const mapped = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setVideoUploads((prev) => [...prev, ...mapped]);
  }

  function addYoutubeLink() {
    const link = youtubeInput.trim();
    if (!link) return;
    setYoutubeLinks((prev) => Array.from(new Set([...prev, link])));
    setYoutubeInput('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title) {
      alert('Title is required');
      return;
    }
    setUploading(true);

    const fd = new FormData();
    fd.append('title', form.title);
    if (form.slug) fd.append('slug', form.slug);
    if (form.category) fd.append('category', form.category);
    fd.append('shortDescription', form.shortDescription);
    fd.append('content', form.content);

    existingImages.forEach((url) => fd.append('images', url));
    existingVideos.forEach((url) => fd.append('videos', url));
    youtubeLinks.forEach((url) => fd.append('youtubeLinks', url));
    removeExistingImages.forEach((url) => fd.append('removeExistingImages', url));
    removeExistingVideos.forEach((url) => fd.append('removeExistingVideos', url));
    removeExistingYoutubeLinks.forEach((url) => fd.append('removeExistingYoutubeLinks', url));
    imageUploads.forEach(({ file }) => fd.append('imageFiles', file));
    videoUploads.forEach(({ file }) => fd.append('videoFiles', file));

    try {
      if (mode === 'create') {
        await apiPost('/blogs', fd);
      } else {
        await apiPut(`/blogs/${initialData._id}`, fd);
      }
      router.push('/admin/blogs');
    } catch (err) {
      alert(err.message || 'Failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <input
        className="border p-2 rounded w-full"
        placeholder="Title"
        value={form.title}
        onChange={(e) => handleTitleChange(e.target.value)}
        required
      />
      <input
        className="border p-2 rounded w-full"
        placeholder="Slug (optional)"
        value={form.slug}
        onChange={(e) => update('slug', slugify(e.target.value))}
      />

      <div className="space-y-1">
        <label className="block font-medium">Short Description</label>
        <input
          className="border p-2 rounded w-full"
          placeholder="Short teaser for cards"
          value={form.shortDescription}
          onChange={(e) => update('shortDescription', e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="block font-medium">Category</label>
        <select
          className="border p-2 rounded w-full"
          value={form.category}
          onChange={(e) => update('category', e.target.value)}
        >
          <option value="">Select category</option>
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="bg-slate-800 text-white px-3 py-2 rounded"
            onClick={() => imageInputRef.current?.click()}
          >
            Add Images
          </button>
          {imageUploads.length > 0 && (
            <span className="text-sm text-slate-600">{imageUploads.length} new image(s)</span>
          )}
        </div>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageSelect}
        />
        <div className="flex flex-wrap gap-3">
          {existingImages.map((url) => (
            <div key={url} className="relative w-32 h-24">
              <img src={url} alt="Existing" className="w-full h-full object-cover rounded border" />
              <button
                type="button"
                className="absolute top-1 right-1 bg-black/70 text-white text-xs rounded px-2 py-1"
                onClick={() => {
                  setExistingImages((prev) => prev.filter((i) => i !== url));
                  if (hasInitialImages.has(url)) {
                    setRemoveExistingImages((prev) => [...prev, url]);
                  }
                }}
              >
                Remove
              </button>
            </div>
          ))}
          {imageUploads.map(({ preview }, idx) => (
            <div key={preview} className="relative w-32 h-24">
              <img src={preview} alt="Upload" className="w-full h-full object-cover rounded border" />
              <button
                type="button"
                className="absolute top-1 right-1 bg-black/70 text-white text-xs rounded px-2 py-1"
                onClick={() =>
                  setImageUploads((prev) => prev.filter((_, uploadIdx) => uploadIdx !== idx))
                }
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="bg-slate-800 text-white px-3 py-2 rounded"
            onClick={() => videoInputRef.current?.click()}
          >
            Add Videos
          </button>
          {videoUploads.length > 0 && (
            <span className="text-sm text-slate-600">{videoUploads.length} new video(s)</span>
          )}
        </div>
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          multiple
          className="hidden"
          onChange={handleVideoSelect}
        />
        <div className="flex flex-wrap gap-3">
          {existingVideos.map((url) => (
            <div key={url} className="relative w-40">
              <video src={url} className="w-full rounded border" controls />
              <button
                type="button"
                className="absolute top-1 right-1 bg-black/70 text-white text-xs rounded px-2 py-1"
                onClick={() => {
                  setExistingVideos((prev) => prev.filter((i) => i !== url));
                  if (hasInitialVideos.has(url)) {
                    setRemoveExistingVideos((prev) => [...prev, url]);
                  }
                }}
              >
                Remove
              </button>
            </div>
          ))}
          {videoUploads.map(({ preview }, idx) => (
            <div key={preview} className="relative w-40">
              <video src={preview} className="w-full rounded border" controls />
              <button
                type="button"
                className="absolute top-1 right-1 bg-black/70 text-white text-xs rounded px-2 py-1"
                onClick={() =>
                  setVideoUploads((prev) => prev.filter((_, uploadIdx) => uploadIdx !== idx))
                }
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block font-medium">YouTube Links</label>
        <div className="flex gap-3">
          <input
            className="border p-2 rounded w-full"
            placeholder="Paste YouTube link"
            value={youtubeInput}
            onChange={(e) => setYoutubeInput(e.target.value)}
          />
          <button type="button" className="bg-blue-600 text-white px-3 py-2 rounded" onClick={addYoutubeLink}>
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {youtubeLinks.map((link) => (
            <span
              key={link}
              className="inline-flex items-center gap-2 bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-sm"
            >
              {link}
              <button
                type="button"
                onClick={() => {
                  setYoutubeLinks((prev) => prev.filter((l) => l !== link));
                  if (hasInitialYoutube.has(link)) {
                    setRemoveExistingYoutubeLinks((prev) => [...prev, link]);
                  }
                }}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-medium mb-2">Content</label>
        <ReactQuill theme="snow" value={form.content} onChange={(val) => update('content', val)} />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
        disabled={uploading}
      >
        {uploading ? 'Saving...' : mode === 'create' ? 'Create Blog' : 'Update Blog'}
      </button>
    </form>
  );
}
