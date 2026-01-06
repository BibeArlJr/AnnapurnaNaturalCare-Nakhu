"use client";

import { useEffect, useRef, useState } from "react";
import { apiGet, buildApiUrl } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errorMessage";
import MediaSection from "@/components/admin/MediaSection";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

function makeSlug(val = "") {
  return val
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export default function EditPackageModal({ open, onClose, onSaved, pkg }) {
  const fileInputRef = useRef(null);
  const [departments, setDepartments] = useState([]);
  const [treatmentTypes, setTreatmentTypes] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    duration: "",
    treatmentType: "",
    department: "",
    shortDescription: "",
    longDescription: "",
    included: "",
    slug: "",
    galleryImages: [],
    promoVideos: [],
    videoUrl: "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      loadLookups();
      const promoList = Array.isArray(pkg?.promoVideos)
        ? pkg.promoVideos.map((v) => (typeof v === "string" ? v : v?.url)).filter(Boolean)
        : pkg?.promoVideo
        ? [pkg.promoVideo]
        : [];
      const firstPromo = promoList[0] || "";
      setForm({
        name: pkg?.name || "",
        price: pkg?.price || "",
        duration: pkg?.durationDays || pkg?.duration || "",
        treatmentType:
          pkg?.treatmentType?._id ||
          pkg?.treatmentType ||
          pkg?.treatmentType?.id ||
          "",
        department: pkg?.department?._id || pkg?.department || pkg?.departments?.[0]?._id || pkg?.departments?.[0] || "",
        shortDescription: pkg?.shortDescription || "",
        longDescription: pkg?.longDescription || "",
        included: (pkg?.included || []).join("\n"),
        slug: pkg?.slug || makeSlug(pkg?.name || ""),
        galleryImages: pkg?.galleryImages || [],
        promoVideos: promoList,
        videoUrl: pkg?.videoUrl || firstPromo,
      });
      setFile(null);
      setPreview(pkg?.imageUrl || null);
      setSubmitting(false);
    }
  }, [open, pkg]);

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

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "name") {
      const autoSlug = makeSlug(value);
      setForm((prev) => {
        const prevAuto = makeSlug(prev.name || "");
        const shouldUpdateSlug = !prev.slug || prev.slug === prevAuto;
        return { ...prev, name: value, slug: shouldUpdateSlug ? autoSlug : prev.slug };
      });
      return;
    }
    if (name === "slug") {
      setForm((prev) => ({ ...prev, slug: makeSlug(value) }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
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
      const finalSlug = form.slug?.trim() ? form.slug.trim() : makeSlug(form.name || "");
      if (!finalSlug) {
        throw new Error("Slug is required");
      }
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("price", form.price);
      fd.append("duration", form.duration);
      fd.append("durationDays", form.duration);
      fd.append("shortDescription", form.shortDescription);
      fd.append("longDescription", form.longDescription);
      fd.append("included", form.included);
      fd.append("slug", finalSlug);
      if (form.department) {
        fd.append("department", form.department);
        fd.append("departments", form.department);
      }
      if (form.treatmentType) {
        fd.append("treatmentType", form.treatmentType);
      }
      if (file) {
        fd.append("coverImage", file);
      } else if (preview) {
        fd.append("coverImage", preview);
      }

      (form.galleryImages || []).forEach((img) => {
        if (img) fd.append("galleryImages[]", img);
      });
      const promoList = [...(form.promoVideos || [])];
      if (form.videoUrl) promoList.push(form.videoUrl);
      promoList.forEach((vid) => {
        if (vid) fd.append("promoVideos[]", vid);
      });

      const res = await fetch(buildApiUrl(`/packages/${pkg?._id}`), {
        method: "PUT",
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
        const message = getApiErrorMessage({ data }, "Failed to update package");
        throw new Error(message);
      }
      onSaved?.();
      onClose?.();
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to update package"));
    } finally {
      setSubmitting(false);
    }
  }

  const inputClasses =
    "w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0f131a] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-white bg-slate-700/40 hover:bg-slate-700 rounded-full p-2 transition"
        >
          ✕
        </button>

        <div className="px-6 pt-6 pb-3 border-b border-slate-800 flex-shrink-0">
          <h2 className="text-xl font-semibold text-white">Edit Package</h2>
          <p className="text-sm text-slate-400 mt-1">Update package details.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 min-h-0 overflow-y-auto px-6 pb-6 pt-4 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-slate-300">Name</label>
              <input name="name" value={form.name} onChange={handleChange} className={inputClasses} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate-300">Slug</label>
              <input
                name="slug"
                value={form.slug}
                onChange={handleChange}
                className={inputClasses}
                required
              />
              <p className="text-xs text-slate-500">Generated from name; you can adjust if needed.</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate-300">Price</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                className={inputClasses}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate-300">Duration</label>
              <input name="duration" value={form.duration} onChange={handleChange} className={inputClasses} />
            </div>
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

          <div className="space-y-1">
            <label className="text-sm text-slate-300">Short Description</label>
            <input
              name="shortDescription"
              value={form.shortDescription}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>

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

          <div className="space-y-1">
            <label className="text-sm text-slate-300">Included (comma or new line)</label>
            <textarea
              name="included"
              value={form.included}
              onChange={handleChange}
              rows={3}
              className={`${inputClasses} resize-none`}
              placeholder="Consultation&#10;Therapy sessions&#10;Diet plan"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className="border-2 border-dashed border-slate-700 bg-slate-900/40 rounded-xl p-4 flex flex-col items-center justify-center text-slate-300 cursor-pointer hover:border-teal-500 transition"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
              {!preview ? (
                <>
                  <p className="font-medium">Cover image</p>
                  <p className="text-xs text-slate-500">Click or drop PNG/JPG</p>
                </>
              ) : (
                <img
                  src={preview}
                  alt="Preview"
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
              <label className="text-sm text-slate-300">YouTube link (optional)</label>
              <input
                type="text"
                value={form.videoUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, videoUrl: e.target.value }))}
                placeholder="Paste a YouTube URL"
                className={inputClasses}
              />
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
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
