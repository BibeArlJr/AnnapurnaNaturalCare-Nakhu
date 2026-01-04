"use client";

import { useEffect, useRef, useState } from "react";
import { apiPost } from "@/lib/api";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function AddDepartmentModal({ open, onClose, onSaved }) {
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [videoLinks, setVideoLinks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    tagline: "",
    description: "",
    isActive: true,
    image: "",
    heroImage: "",
    coverImage: "",
    images: [],
    videos: [],
  });

  useEffect(() => {
    if (open) {
      setForm({
        name: "",
        tagline: "",
        description: "",
        isActive: true,
        image: "",
        heroImage: "",
        coverImage: "",
        images: [],
        videos: [],
      });
      setPreview(null);
      setFileName("");
      setFile(null);
      setGalleryFiles([]);
      setVideoFiles([]);
      setVideoLinks("");
      setSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  function handleInputChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleToggle() {
    setForm((prev) => ({ ...prev, isActive: !prev.isActive }));
  }

  function readFile(file) {
    if (!file) return;
    setFile(file);
    setPreview(URL.createObjectURL(file));
    setFileName(file.name);
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

  function handleGalleryChange(e) {
    const files = Array.from(e.target.files || []);
    const mapped = files.slice(0, 10 - ((form.images?.length || 0) + galleryFiles.length)).map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
      name: f.name,
    }));
    setGalleryFiles((prev) => [...prev, ...mapped]);
  }

  function removeGalleryFile(idx) {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleVideoChange(e) {
    const files = Array.from(e.target.files || []);
    const mapped = files.map((f) => ({ file: f, name: f.name }));
    setVideoFiles((prev) => [...prev, ...mapped]);
  }

  async function uploadToCloudinary(uploadFile) {
    const formData = new FormData();
    formData.append("image", uploadFile);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.url || data.secure_url;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name) return;
    setSubmitting(true);
    try {
      const uploadFiles = async (files, folder) => {
        if (!files?.length) return [];
        const uploads = await Promise.all(
          files.map(async (currentFile) => {
            const fd = new FormData();
            fd.append("image", currentFile);
            if (folder) fd.append("folder", folder);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
              method: "POST",
              body: fd,
              credentials: "include",
            });
            if (!res.ok) throw new Error("Upload failed");
            const data = await res.json();
            return data.secure_url || data.url;
          })
        );
        return uploads.filter(Boolean);
      };

      let uploadedUrl = form.coverImage || form.image || form.heroImage;
      if (file) {
        const [url] = await uploadFiles([file], "departments");
        uploadedUrl = url || uploadedUrl;
      }

      // gallery images
      let images = [...(form.images || [])];
      if (galleryFiles.length) {
        const urls = await uploadFiles(galleryFiles.map((g) => g.file), "departments");
        images = [...images, ...urls].slice(0, 10);
      }

      // videos
      let videos = [...(form.videos || [])];
      const linkVideos = videoLinks
        .split(/\n|,/)
        .map((l) => l.trim())
        .filter(Boolean);
      videos = [...videos, ...linkVideos];
      if (videoFiles.length) {
        const urls = await uploadFiles(videoFiles.map((v) => v.file), "departments");
        videos = [...videos, ...urls];
      }

      const payload = {
        ...form,
        image: uploadedUrl,
        heroImage: uploadedUrl,
        coverImage: uploadedUrl,
        images,
        videos,
      };
      await apiPost("/departments", payload);
      onSaved?.();
      onClose?.();
    } catch (err) {
      alert(err.message || "Failed to save department");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClasses =
    "w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#0d1218] border border-slate-800 rounded-2xl shadow-2xl flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-white bg-slate-700/40 hover:bg-slate-700 rounded-full p-2 transition"
        >
          ✕
        </button>

        <div className="px-6 pt-6 pb-3 border-b border-slate-800">
          <h2 className="text-xl font-semibold text-white">Add Department</h2>
          <p className="text-sm text-slate-400 mt-1">
            Create a new specialty, upload a cover image, and set its status.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 pb-6 pt-4 space-y-6">
          {/* Basic info */}
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Details</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-slate-300">Department Name</label>
                <input
                  name="name"
                  required
                  value={form.name}
                  onChange={handleInputChange}
                  className={inputClasses}
                  placeholder="e.g. Physiotherapy"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-300">Short Tagline (optional)</label>
                <input
                  name="tagline"
                  value={form.tagline}
                  onChange={handleInputChange}
                  className={inputClasses}
                  placeholder="e.g. Restore your mobility"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Description</label>
              <ReactQuill
                theme="snow"
                value={form.description}
                onChange={(value) => setForm((prev) => ({ ...prev, description: value }))}
                placeholder="Write detailed department description..."
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ["bold", "italic", "underline"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["link"],
                    ["clean"],
                  ],
                }}
              />
            </div>
          </div>

          {/* Upload */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-slate-300">Upload Cover Image</p>
                <p className="text-xs text-slate-500">Drag & drop or click to choose a cover image.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Status</span>
                <button
                  type="button"
                  onClick={handleToggle}
                  className={`relative inline-flex h-9 w-16 items-center rounded-full border transition ${
                    form.isActive ? "bg-teal-600 border-teal-500" : "bg-slate-700 border-slate-600"
                  }`}
                >
                  <span
                    className={`inline-block h-7 w-7 transform rounded-full bg-white shadow transition ${
                      form.isActive ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                  <span className="absolute left-2 text-[11px] text-slate-900 font-semibold">
                    {form.isActive ? "On" : ""}
                  </span>
                  <span className="absolute right-2 text-[11px] text-slate-200 font-semibold">
                    {!form.isActive ? "Off" : ""}
                  </span>
                </button>
              </div>
            </div>

            <div
              className="border-2 border-dashed border-slate-700 bg-slate-900/40 rounded-xl p-4 flex flex-col gap-3 items-center justify-center text-slate-300 cursor-pointer hover:border-teal-500 transition"
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
                <p className="text-xs text-slate-500">
                  Recommended: landscape, under 5MB. JPG or PNG.
                </p>
              </div>
              {fileName && (
                <p className="text-xs text-teal-300">Selected: {fileName}</p>
              )}
              {preview && (
                <div className="w-full grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4 items-center">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full max-w-[180px] h-28 object-cover rounded-lg border border-slate-700"
                  />
                  <p className="text-sm text-slate-400">
                    This preview will be uploaded to Cloudinary and saved with the department.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">Gallery Images</p>
                  <p className="text-xs text-slate-500">You can add up to 10 supporting images.</p>
                </div>
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-700 text-slate-100 hover:bg-slate-800"
                >
                  Add images
                </button>
              </div>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleGalleryChange}
              />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {galleryFiles.map((g, idx) => (
                  <div
                    key={`${g.name}-${idx}`}
                    className="relative rounded-lg overflow-hidden border border-slate-700 bg-slate-900"
                  >
                    <img src={g.preview} alt={g.name} className="h-28 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeGalleryFile(idx)}
                      className="absolute top-1 right-1 rounded-full bg-black/60 text-white text-xs px-2 py-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {(form.images || []).map((url, idx) => (
                  <div
                    key={`existing-${idx}`}
                    className="relative rounded-lg overflow-hidden border border-slate-700 bg-slate-900"
                  >
                    <img src={url} alt={`Image ${idx + 1}`} className="h-28 w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">Videos (optional)</p>
                  <p className="text-xs text-slate-500">Upload video files or paste links (one per line).</p>
                </div>
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-700 text-slate-100 hover:bg-slate-800"
                >
                  Upload videos
                </button>
              </div>
              <textarea
                value={videoLinks}
                onChange={(e) => setVideoLinks(e.target.value)}
                placeholder="Paste video URLs (YouTube or direct) – one per line"
                className={inputClasses}
                rows={3}
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={handleVideoChange}
              />
              {(videoFiles.length > 0 || form.videos?.length) && (
                <div className="space-y-2">
                  {videoFiles.map((v, idx) => (
                    <div key={`${v.name}-${idx}`} className="flex items-center justify-between text-xs text-slate-300">
                      <span>{v.name}</span>
                      <button
                        type="button"
                        onClick={() => setVideoFiles((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-rose-300 hover:text-rose-200"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {form.videos?.map((v, idx) => (
                    <div key={`saved-${idx}`} className="text-xs text-slate-400">
                      {v}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>

        <div className="mt-auto border-t border-slate-800 bg-[#0b1017] px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-500 transition disabled:opacity-70"
          >
            {submitting ? "Saving..." : "Save Department"}
          </button>
        </div>
      </div>
    </div>
  );
}
