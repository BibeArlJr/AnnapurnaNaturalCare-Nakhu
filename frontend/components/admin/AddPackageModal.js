"use client";

import { useEffect, useRef, useState } from "react";
import { apiGet } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errorMessage";
import MediaSection from "@/components/admin/MediaSection";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function AddPackageModal({ open, onClose, onSaved }) {
  const fileInputRef = useRef(null);
  const [departments, setDepartments] = useState([]);
  const [treatmentTypes, setTreatmentTypes] = useState([]);
  const [hasEditedSlug, setHasEditedSlug] = useState(false);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    price: "",
    duration: "",
    treatmentType: "",
    department: "",
    shortDescription: "",
    longDescription: "",
    included: "",
    galleryImages: [],
    promoVideos: [],
    videoUrl: "",
  });

  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      loadLookups();
      setForm({
        name: "",
        slug: "",
        price: "",
        duration: "",
        treatmentType: "",
        department: "",
        shortDescription: "",
        longDescription: "",
        included: "",
        galleryImages: [],
        promoVideos: [],
        videoUrl: "",
      });
      setCoverFile(null);
      setCoverPreview(null);
      setSubmitting(false);
      setHasEditedSlug(false);
    }
  }, [open]);

  async function loadLookups() {
    try {
      const res = await apiGet("/departments");
      const data = res?.data || res || [];
      setDepartments(data);
    } catch (err) {
      console.error("Departments load error:", err);
    }
    try {
      const res = await apiGet("/treatment-types");
      const data = res?.data || res || [];
      setTreatmentTypes(data);
    } catch (err) {
      console.error("Treatment types load error:", err);
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
      setCoverFile(f);
      setCoverPreview(URL.createObjectURL(f));
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) {
      setCoverFile(f);
      setCoverPreview(URL.createObjectURL(f));
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
      if (form.duration !== "") {
        fd.append("duration", Number(form.duration));
        fd.append("durationDays", Number(form.duration));
      }
      fd.append("shortDescription", form.shortDescription);
      if (form.longDescription) fd.append("description", form.longDescription);

      const includedItems = (form.included || "")
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean);
      includedItems.forEach((item) => fd.append("included[]", item));

      if (form.department) {
        fd.append("department", form.department);
        fd.append("departments", form.department);
      }

      if (form.treatmentType) {
        fd.append("treatmentType", form.treatmentType);
      }

      if (coverFile) fd.append("coverImage", coverFile);
      if (coverPreview && !coverFile) fd.append("coverImage", coverPreview);

      (form.galleryImages || []).forEach((img) => {
        if (img) fd.append("galleryImages[]", img);
      });
      const promoList = [...(form.promoVideos || [])];
      if (form.videoUrl) promoList.push(form.videoUrl);
      promoList.forEach((vid) => {
        if (vid) fd.append("promoVideos[]", vid);
      });

      const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
      const res = await fetch(`${base}/api/packages`, {
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
              <label className="text-sm text-slate-300">Price ($)</label>
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

            {/* Treatment Type */}
            <div className="space-y-1">
              <label className="text-sm text-slate-300">Treatment Type</label>
              <select
                name="treatmentType"
                value={form.treatmentType}
                onChange={handleChange}
                className={`${inputClasses} bg-slate-900`}
                required
              >
                <option value="">Select treatment type</option>
                {treatmentTypes.map((type) => (
                  <option key={type._id} value={type._id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div className="space-y-1">
              <label className="text-sm text-slate-300">Department</label>
              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                className={`${inputClasses} bg-slate-900`}
                required
              >
                <option value="">Select department</option>
                {departments.map((dep) => (
                  <option key={dep._id} value={dep._id}>
                    {dep.name}
                  </option>
                ))}
              </select>
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
          <div className="space-y-2">
            <label className="text-sm text-slate-300">Long Description</label>
            <div className="bg-slate-900/40 border border-slate-700 rounded-xl">
              <ReactQuill
                theme="snow"
                value={form.longDescription}
                onChange={(val) => setForm((prev) => ({ ...prev, longDescription: val }))}
              />
            </div>
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

          {/* Media Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cover Image */}
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

              {!coverPreview ? (
                <>
                  <p className="font-medium">Cover image</p>
                  <p className="text-xs text-slate-500">Click or drop PNG/JPG</p>
                </>
              ) : (
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="w-full max-w-xs h-32 object-cover rounded-lg border border-slate-700"
                />
              )}
            </div>

          <MediaSection
            title="Media"
            images={form.galleryImages}
            setImages={(list) => setForm((prev) => ({ ...prev, galleryImages: list.slice(0, 10) }))}
            videos={form.promoVideos}
            setVideos={(list) => setForm((prev) => ({ ...prev, promoVideos: list.slice(0, 3) }))}
            maxImages={10}
            maxVideos={3}
          />
          <div className="space-y-1">
            <label className="text-sm text-slate-300">YouTube / Vimeo link (optional)</label>
            <input
              type="text"
              value={form.videoUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, videoUrl: e.target.value }))}
              placeholder="Paste a video URL"
              className={inputClasses}
            />
          </div>
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
