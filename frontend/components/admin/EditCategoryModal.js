"use client";

import { useEffect, useState } from "react";
import { apiPut } from "@/lib/api";

export default function EditCategoryModal({ open, onClose, category, onCategoryUpdated }) {
  const [form, setForm] = useState({ name: "", slug: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && category) {
      setForm({
        name: category.name || "",
        slug: category.slug || "",
      });
      setSubmitting(false);
    }
  }, [open, category]);

  if (!open) return null;

  const inputClasses =
    "w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500";

  function handleNameChange(e) {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setForm({ name, slug });
  }

  function handleSlugChange(e) {
    setForm((prev) => ({ ...prev, slug: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!category?._id) return;
    setSubmitting(true);
    try {
      const res = await apiPut(`/blog/categories/${category._id}`, form);
      onCategoryUpdated?.(res?.data || res);
      onClose?.();
    } catch (err) {
      alert(err.message || "Failed to update category");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="relative w-full max-w-md bg-[#0d1218] border border-slate-800 rounded-2xl shadow-2xl p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-white bg-slate-700/40 hover:bg-slate-700 rounded-full p-2 transition"
        >
          ✕
        </button>
        <h3 className="text-lg font-semibold text-white mb-3">Edit Category</h3>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-sm text-slate-300">Name</label>
            <input
              value={form.name}
              onChange={handleNameChange}
              className={inputClasses}
              placeholder="Wellness"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-300">Slug</label>
            <input
              value={form.slug}
              onChange={handleSlugChange}
              className={inputClasses}
              placeholder="wellness"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-500 transition disabled:opacity-70"
            >
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
