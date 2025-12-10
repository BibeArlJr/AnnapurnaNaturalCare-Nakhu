"use client";

import { useEffect, useRef, useState } from "react";
import { apiGet } from "@/lib/api";

export default function AddPackageModal({ open, onClose, onSaved }) {
  const fileInputRef = useRef(null);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    duration: "",
    shortDescription: "",
    longDescription: "",
    included: "",
    departmentId: "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      loadDepartments();
      setForm({
        name: "",
        price: "",
        duration: "",
        shortDescription: "",
        longDescription: "",
        included: "",
        departmentId: "",
      });
      setFile(null);
      setPreview(null);
      setSubmitting(false);
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

  function handleChange(e) {
    const { name, value } = e.target;
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
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("price", form.price);
      fd.append("duration", form.duration);
      fd.append("shortDescription", form.shortDescription);
      fd.append("longDescription", form.longDescription);
      fd.append("included", form.included);
      fd.append("departmentId", form.departmentId);
      if (file) fd.append("image", file);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/packages`, {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to save package");
      onSaved?.();
      onClose?.();
    } catch (err) {
      alert(err.message || "Failed to save package");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClasses =
    "w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0f131a] border border-white/10 rounded-2xl shadow-2xl flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-white bg-slate-700/40 hover:bg-slate-700 rounded-full p-2 transition"
        >
          ✕
        </button>

        <div className="px-6 pt-6 pb-3 border-b border-slate-800">
          <h2 className="text-xl font-semibold text-white">Add Package</h2>
          <p className="text-sm text-slate-400 mt-1">
            Create a new service package with pricing and details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 pb-6 pt-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-slate-300">Name</label>
              <input name="name" value={form.name} onChange={handleChange} className={inputClasses} required />
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
              <label className="text-sm text-slate-300">Department</label>

              <div className="relative">
                <select
                  name="departmentId"
                  value={form.departmentId}
                  onChange={handleChange}
                  className="
                    appearance-none
                    w-full 
                    bg-slate-800 
                    border border-slate-700 
                    rounded-xl 
                    px-4 py-3 
                    text-white 
                    placeholder-slate-500
                    focus:outline-none 
                    focus:ring-2 
                    focus:ring-teal-500
                    cursor-pointer
                  "
                >
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>

                {/* Custom dropdown arrow */}
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400 text-sm">
                  ▼
                </div>
              </div>
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

          <div className="space-y-1">
            <label className="text-sm text-slate-300">Long Description</label>
            <textarea
              name="longDescription"
              value={form.longDescription}
              onChange={handleChange}
              rows={3}
              className={`${inputClasses} resize-none`}
            />
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
            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
            {!preview ? (
              <>
                <p className="font-medium">Drop an image here or click to upload</p>
                <p className="text-xs text-slate-500">PNG, JPG under 5MB</p>
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
