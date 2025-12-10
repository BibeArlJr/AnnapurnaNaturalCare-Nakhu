"use client";

import { useEffect, useRef, useState } from "react";
import { apiPost } from "@/lib/api";

export default function AddDepartmentModal({ open, onClose, onSaved }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    tagline: "",
    description: "",
    isActive: true,
    imageData: "",
  });

  useEffect(() => {
    if (open) {
      setForm({
        name: "",
        tagline: "",
        description: "",
        isActive: true,
        imageData: "",
      });
      setPreview(null);
      setFileName("");
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
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, imageData: reader.result }));
      setPreview(reader.result);
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

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name) return;
    setSubmitting(true);
    try {
      await apiPost("/departments", form);
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
            <div className="space-y-1">
              <label className="text-sm text-slate-300">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleInputChange}
                rows={4}
                className={`${inputClasses} resize-none`}
                placeholder="Describe services, specialties, and care focus."
              />
            </div>
          </div>

          {/* Upload */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-slate-300">Upload Image</p>
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
