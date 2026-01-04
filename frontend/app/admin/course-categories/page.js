"use client";

import { useEffect, useState } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errorMessage";
import { PlusIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  status: "active",
};

export default function CourseCategoriesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hasEditedSlug, setHasEditedSlug] = useState(false);

  const toSlug = (value = "") =>
    value
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiGet("/course-categories");
      setItems(res?.data || res || []);
    } catch (err) {
      console.error("Category load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startCreate = () => {
    setForm(emptyForm);
    setEditing(null);
    setHasEditedSlug(false);
    setOpen(true);
  };

  const startEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name || "",
      slug: item.slug || "",
      description: item.description || "",
      status: item.status || "active",
    });
    setHasEditedSlug(true);
    setOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "name" && !hasEditedSlug) {
      setForm((prev) => ({ ...prev, name: value, slug: toSlug(value) }));
      return;
    }
    if (name === "slug") setHasEditedSlug(true);
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const save = async () => {
    if (!form.name.trim()) {
      alert("Name is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description,
        status: form.status,
      };
      if (editing) {
        await apiPut(`/course-categories/${editing._id}`, payload);
      } else {
        await apiPost("/course-categories", payload);
      }
      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
      load();
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to save category"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this category?")) return;
    try {
      await apiDelete(`/course-categories/${id}`);
      load();
    } catch (err) {
      alert(getApiErrorMessage(err, "Delete failed"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Course Categories</h1>
          <p className="text-sm text-slate-400">Manage dynamic categories for courses.</p>
        </div>
        <button
          onClick={startCreate}
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg transition"
        >
          <PlusIcon className="h-5 w-5" />
          Add Category
        </button>
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm">Loading...</p>
      ) : items.length === 0 ? (
        <div className="text-slate-400 text-sm bg-slate-900 border border-slate-800 rounded-lg p-6">No categories yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item._id} className="rounded-xl border border-white/10 bg-[#0f131a] p-4 space-y-3 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <p className="text-white font-semibold line-clamp-2">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.slug}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs ${
                    item.status === "active" ? "bg-green-900/60 text-green-300" : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {item.status}
                </span>
              </div>
              <p className="text-sm text-slate-300 line-clamp-3">{item.description}</p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => startEdit(item)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm"
                >
                  <PencilSquareIcon className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => remove(item._id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-800 text-red-100 text-sm"
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-3xl max-h-[90vh] bg-[#0f131a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-semibold text-white">{editing ? "Edit Category" : "Add Category"}</h2>
                <p className="text-sm text-slate-400">Dynamic categories for courses.</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white text-xl leading-none">
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div className="space-y-1">
                <label className="text-sm text-slate-300">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-300">Slug (optional)</label>
                <input
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white"
                  placeholder="Auto from name if left blank"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-300">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-300">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3">
              <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg bg-slate-800 text-white">
                Cancel
              </button>
              <button onClick={save} disabled={saving} className="px-4 py-2 rounded-lg bg-teal-600 text-white disabled:opacity-60">
                {saving ? "Saving..." : editing ? "Save changes" : "Create Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
