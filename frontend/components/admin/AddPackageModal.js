"use client";

import { useEffect, useRef, useState } from "react";
import { apiGet } from "@/lib/api";
import MultiSelect from "@/components/ui/MultiSelect";
import { getApiErrorMessage } from "@/lib/errorMessage";

export default function AddPackageModal({ open, onClose, onSaved }) {
  const fileInputRef = useRef(null);
  const [departments, setDepartments] = useState([]);
  const [hasEditedSlug, setHasEditedSlug] = useState(false);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    price: "",
    duration: "",
    shortDescription: "",
    longDescription: "",
    included: "",
    departments: [],
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      loadDepartments();
      setForm({
        name: "",
        slug: "",
        price: "",
        duration: "",
        shortDescription: "",
        longDescription: "",
        included: "",
        departments: [],
      });
      setFile(null);
      setPreview(null);
      setSubmitting(false);
      setHasEditedSlug(false);
    }
  }, [open]);

  async function loadDepartments() {
    try {
      const res = await apiGet("/departments");
      const data = res?.data || res || [];
      setDepartments(data);
    } catch (err) {
      console.error("Departments load error:", err);
    }
  }

  if (!open) return null;

  function toSlug(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "name" && !hasEditedSlug) {
        next.slug = toSlug(value);
      }
      return next;
    });
  }

  function handleSlugChange(e) {
    const value = toSlug(e.target.value);
    setHasEditedSlug(true);
    setForm((prev) => ({ ...prev, slug: value }));
  }

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("name", form.name);
      if (form.slug) fd.append("slug", form.slug);
      if (form.price !== "") fd.append("price", Number(form.price));
      if (form.duration !== "") fd.append("duration", Number(form.duration));
      fd.append("shortDescription", form.shortDescription);
      if (form.longDescription) fd.append("description", form.longDescription);

      const includedItems = (form.included || "")
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean);
      includedItems.forEach((item) => fd.append("included[]", item));

      form.departments.forEach((dep) => {
        const depId = typeof dep === "object" && dep !== null ? dep._id || dep.id || dep.value : dep;
        if (depId) fd.append("departments", depId);
      });

      if (file) fd.append("image", file);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/packages`, {
        method: "POST",
        body: fd,
        credentials: "include",
      });

      let data;
      try {
        data = await res.json();
      } catch (_) {
        data = null;
      }

      if (!res.ok) {
        const message = getApiErrorMessage({ data }, "Failed to save package");
        throw new Error(message);
      }

      onSaved?.();
      onClose?.();
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to save package"));
    } finally {
      setSubmitting(false);
    }
  }

  const inputClasses =
    "w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0f131a] border border-white/10 rounded-2xl shadow-2xl flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-white bg-slate-700/40 hover:bg-slate-700 rounded-full p-2 transition"
        >
          ✕
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-3 border-b border-slate-800">
          <h2 className="text-xl font-semibold text-white">Add Package</h2>
          <p className="text-sm text-slate-400 mt-1">
            Create a new service package with pricing, departments, and details.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 pb-6 pt-4 space-y-6">

          {/* GRID: Name, Price, Duration, Departments */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Name */}
            <div className="space-y-1">
              <label className="text-sm text-slate-300">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className={inputClasses}
                required
              />
            </div>

            {/* Slug */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-300">Slug</label>
                <span className="text-xs text-slate-500">Used in URLs. Auto-generated from name.</span>
              </div>
              <input
                name="slug"
                value={form.slug}
                onChange={handleSlugChange}
                className={inputClasses}
                placeholder="naturopathy-detox-program"
              />
            </div>

            {/* Price */}
            <div className="space-y-1">
              <label className="text-sm text-slate-300">Price (NPR)</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                className={inputClasses}
                required
              />
            </div>

            {/* Duration */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-300">Duration</label>
                <span className="text-xs text-slate-500">
                  (Total days of the treatment package)
                </span>
              </div>

              <input
                name="duration"
                value={form.duration}
                onChange={handleChange}
                className={inputClasses}
                placeholder="e.g., 7, 14, 21"
              />
            </div>

            {/* Departments — aligned */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-300">Departments</label>

                {/* Invisible subtitle to match the height of Duration */}
                <span className="text-xs text-transparent">(placeholder)</span>
              </div>

              <MultiSelect
                options={departments}
                selected={form.departments}
                onChange={(newDepts) =>
                  setForm((prev) => ({ ...prev, departments: newDepts }))
                }
              />
            </div>

          </div>

          {/* Short Description */}
          <div className="space-y-1">
            <label className="text-sm text-slate-300">Short Description</label>
            <input
              name="shortDescription"
              value={form.shortDescription}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>

          {/* Long Description */}
          <div className="space-y-1">
            <label className="text-sm text-slate-300">Long Description</label>
            <textarea
              name="longDescription"
              value={form.longDescription}
              onChange={handleChange}
              rows={4}
              className={`${inputClasses} resize-none`}
            />
          </div>

          {/* Included */}
          <div className="space-y-1">
            <label className="text-sm text-slate-300">Included (comma or new line)</label>
            <textarea
              name="included"
              value={form.included}
              onChange={handleChange}
              rows={3}
              className={`${inputClasses} resize-none`}
              placeholder={`Consultation\nTherapy sessions\nDiet plan`}
            />
          </div>

          {/* Image Upload */}
          <div
            className="border-2 border-dashed border-slate-700 bg-slate-900/40 rounded-xl p-4 flex flex-col items-center justify-center text-slate-300 cursor-pointer hover:border-teal-500 transition"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />

            {!preview ? (
              <>
                <p className="font-medium">Drop an image here or click to upload</p>
                <p className="text-xs text-slate-500">PNG or JPG under 5MB</p>
              </>
            ) : (
              <img
                src={preview}
                alt="Preview"
                className="w-full max-w-xs h-32 object-cover rounded-lg border border-slate-700"
              />
            )}
          </div>
        </form>

        {/* Footer */}
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
            {submitting ? "Saving..." : "Save Package"}
          </button>
        </div>
      </div>
    </div>
  );
}
