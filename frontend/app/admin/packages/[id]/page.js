"use client";

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";
import MultiSelect from "@/components/ui/MultiSelect";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const inputClasses =
  "w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500";

function makeSlug(val = "") {
  return val
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export default function EditPackagePage({ params }) {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [coverFile, setCoverFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [galleryList, setGalleryList] = useState([]);
  const [promoVideo, setPromoVideo] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    duration: "",
    shortDescription: "",
    longDescription: "",
    included: "",
    departments: [],
    slug: "",
  });

  useEffect(() => {
    loadPackage();
  }, [params?.id]);

  async function loadPackage() {
    setLoading(true);
    setError("");
    try {
      const res = await apiGet(`/packages/${params.id}?includeDrafts=true`);
      const data = res?.data || res || {};
      setForm({
        name: data.name || "",
        price: data.price ?? "",
        duration: data.duration || "",
        shortDescription: data.shortDescription || "",
        longDescription: data.longDescription || "",
        included: Array.isArray(data.included) ? data.included.join("\n") : data.included || "",
        departments: (data.departments || []).map((d) => d?._id || d),
        slug: data.slug || makeSlug(data.name || ""),
      });
      setPreview(data.imageUrl || "");
      setGalleryList((data.galleryImages || []).map((url) => ({ url, file: null })));
      setPromoVideo(data.promoVideo || "");
      setVideoFile(null);
      await loadDepartments();
    } catch (err) {
      setError("Package not found");
    } finally {
      setLoading(false);
    }
  }

  async function loadDepartments() {
    try {
      const res = await apiGet("/departments?includeDrafts=true");
      const data = res?.data || res || [];
      setDepartments(data);
    } catch (err) {
      console.error("Departments load error:", err);
    }
  }

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
      const cleaned = makeSlug(value);
      setForm((prev) => ({ ...prev, slug: cleaned }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function toggleDepartment(id) {
    setForm((prev) => {
      const exists = prev.departments.includes(id);
      return {
        ...prev,
        departments: exists ? prev.departments.filter((d) => d !== id) : [...prev.departments, id],
      };
    });
  }

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (f) {
      setCoverFile(f);
      setPreview(URL.createObjectURL(f));
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) {
      setCoverFile(f);
      setPreview(URL.createObjectURL(f));
    }
  }

  function handleGalleryFiles(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setGalleryList((prev) => [...prev, ...files.map((file) => ({ url: URL.createObjectURL(file), file }))]);
  }

  function removeGallery(idx) {
    setGalleryList((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleVideoFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setVideoFile(f);
    setPromoVideo("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const finalSlug = (form.slug && form.slug.trim()) ? form.slug.trim() : makeSlug(form.name || "");
      if (!finalSlug) {
        throw new Error("Slug is required. Please check the name.");
      }
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("price", form.price);
      fd.append("duration", form.duration);
      fd.append("shortDescription", form.shortDescription);
      fd.append("longDescription", form.longDescription);
      fd.append("included", form.included);
      fd.append("slug", finalSlug);
      form.departments.forEach((dep) => fd.append("departments", dep));
      if (coverFile) {
        fd.append("coverImage", coverFile);
      } else if (preview) {
        fd.append("coverImage", preview);
      }

      galleryList
        .filter((g) => !g.file)
        .forEach((g) => fd.append("galleryImages", g.url));

      galleryList
        .filter((g) => g.file)
        .forEach((g) => fd.append("galleryImages", g.file));

      if (videoFile) {
        fd.append("promoVideo", videoFile);
      } else if (promoVideo) {
        fd.append("promoVideo", promoVideo);
      }

      const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
      const res = await fetch(`${base}/api/packages/${params.id}`, {
        method: "PUT",
        body: fd,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update package");
      router.push("/admin/packages");
    } catch (err) {
      setError(err.message || "Failed to update package");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0f131a] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <button
          onClick={() => router.push("/admin/packages")}
          className="absolute top-4 right-4 text-gray-300 hover:text-white bg-slate-700/40 hover:bg-slate-700 rounded-full p-2 transition"
        >
          ✕
        </button>

        <div className="px-6 pt-6 pb-3 border-b border-slate-800">
          <h2 className="text-xl font-semibold text-white">Edit Package</h2>
          <p className="text-sm text-slate-400">Update package details, pricing, and image.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 pb-6 pt-4 space-y-6">
          {error && (
            <div className="rounded-lg border border-rose-500/40 bg-rose-900/20 text-rose-200 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-slate-800 rounded-lg" />
              <div className="h-24 bg-slate-800 rounded-lg" />
              <div className="h-32 bg-slate-800 rounded-lg" />
            </div>
          ) : (
            <>
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
                <MultiSelect
                  label="Departments"
                  options={departments}
                  selected={form.departments}
                  onChange={(newDepts) => setForm((prev) => ({ ...prev, departments: newDepts }))}
                />
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

              <div className="space-y-2 border border-slate-700 bg-slate-900/40 rounded-xl p-4">
                <label className="text-sm text-slate-300">Promo video</label>
                <input
                  value={videoFile ? "" : promoVideo}
                  onChange={(e) => {
                    setPromoVideo(e.target.value);
                    setVideoFile(null);
                  }}
                  placeholder="Paste video URL"
                  className={inputClasses}
                />
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFile}
                  className="text-sm text-slate-300"
                />
                {videoFile && <p className="text-xs text-teal-300">Video file ready to upload</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm text-slate-300">Gallery images</label>
                <label
                  className="border-2 border-dashed border-slate-700 bg-slate-900/40 rounded-xl p-4 flex flex-col items-center justify-center text-slate-300 cursor-pointer hover:border-teal-500 transition"
                >
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryFiles}
                    className="hidden"
                  />
                  <span className="font-medium">Click to upload or drop files</span>
                  <span className="text-xs text-slate-500">PNG/JPG</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {galleryList.map((g, idx) => (
                    <div key={idx} className="relative h-20 w-20 rounded-lg overflow-hidden border border-slate-700">
                      <img src={g.url} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGallery(idx)}
                        className="absolute top-1 right-1 bg-black/70 text-white rounded-full text-xs px-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </form>

        <div className="mt-auto border-t border-slate-800 bg-[#0b1017] px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/packages")}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={submitting || loading}
            className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-500 transition disabled:opacity-70"
          >
            {submitting ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}
