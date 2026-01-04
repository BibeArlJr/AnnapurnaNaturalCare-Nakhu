"use client";

import { useEffect, useState } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errorMessage";
import { PlusIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import MediaUploader from "@/components/admin/MediaUploader";
import MediaSection from "@/components/admin/MediaSection";
import { PublishToggle } from "@/components/admin/PublishToggle";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const emptyForm = {
  title: "",
  slug: "",
  shortDescription: "",
  longDescription: "",
  durationInDays: "",
  modesAvailable: [],
  pricing: { online: "", residential: "", dayVisitor: "" },
  inclusions: [""],
  outcomes: [""],
  coverImage: "",
  galleryImages: [],
  promoVideos: [],
  videoUrl: "",
  isPublished: false,
};

const MODE_OPTIONS = [
  { value: "online", label: "Online" },
  { value: "residential", label: "Residential" },
  { value: "dayVisitor", label: "Day visitor" },
];

export default function HealthProgramsAdminPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hasEditedSlug, setHasEditedSlug] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

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
      const res = await apiGet("/health-programs");
      setItems(res?.data || res || []);
    } catch (err) {
      console.error("Health programs admin load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const togglePublish = async (item) => {
    setUpdatingId(item._id);
    try {
      const updated = await apiPut(`/health-programs/${item._id}`, { isPublished: !item.isPublished });
      const payload = updated?.data || updated;
      setItems((prev) => prev.map((p) => (p._id === item._id ? { ...p, ...payload } : p)));
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to update publish status"));
    } finally {
      setUpdatingId(null);
    }
  };

  const startCreate = () => {
    setForm(emptyForm);
    setEditing(null);
    setHasEditedSlug(false);
    setOpen(true);
  };

  const startEdit = (item) => {
    setEditing(item);
    setForm({
      ...emptyForm,
      ...item,
      durationInDays: item.durationInDays || "",
      pricing: {
        online: item.pricing?.online ?? "",
        residential: item.pricing?.residential ?? "",
        dayVisitor: item.pricing?.dayVisitor ?? "",
      },
      inclusions: item.inclusions?.length ? item.inclusions : [""],
      outcomes: item.outcomes?.length ? item.outcomes : [""],
      galleryImages: item.galleryImages || [],
      promoVideos: item.promoVideos || [],
      videoUrl: item.videoUrl || (item.promoVideos && item.promoVideos[0]?.url ? item.promoVideos[0].url : ""),
      coverImage: item.coverImage || "",
    });
    setHasEditedSlug(true);
    setOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("pricing.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({ ...prev, pricing: { ...prev.pricing, [key]: value } }));
      return;
    }
    const next = type === "checkbox" ? checked : value;

    if (name === "title" && !hasEditedSlug) {
      setForm((prev) => ({ ...prev, title: next, slug: toSlug(next) }));
      return;
    }
    if (name === "slug") {
      setHasEditedSlug(true);
    }
    setForm((prev) => ({ ...prev, [name]: next }));
  };

  const toggleMode = (value) => {
    setForm((prev) => {
      const exists = prev.modesAvailable.includes(value);
      return {
        ...prev,
        modesAvailable: exists ? prev.modesAvailable.filter((m) => m !== value) : [...prev.modesAvailable, value],
      };
    });
  };

  const updateListField = (key, idx, val) => {
    setForm((prev) => {
      const next = [...prev[key]];
      next[idx] = val;
      return { ...prev, [key]: next };
    });
  };

  const addListField = (key) => setForm((prev) => ({ ...prev, [key]: [...prev[key], ""] }));
  const removeListField = (key, idx) =>
    setForm((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== idx) }));

  const save = async () => {
    if (!form.title.trim()) {
      alert("Title is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        slug: form.slug,
        shortDescription: form.shortDescription,
        longDescription: form.longDescription,
        durationInDays: form.durationInDays ? Number(form.durationInDays) : undefined,
        modesAvailable: form.modesAvailable,
        pricing: {
          online: form.pricing.online === "" ? 0 : Number(form.pricing.online),
          residential: form.pricing.residential === "" ? 0 : Number(form.pricing.residential),
          dayVisitor: form.pricing.dayVisitor === "" ? 0 : Number(form.pricing.dayVisitor),
        },
        inclusions: form.inclusions.filter((i) => i && i.trim()),
        outcomes: form.outcomes.filter((i) => i && i.trim()),
        coverImage: form.coverImage,
        galleryImages: form.galleryImages,
        promoVideos: [...form.promoVideos, form.videoUrl].filter(Boolean).map((url) => ({ type: "url", url })),
        videoUrl: form.videoUrl,
        isPublished: form.isPublished,
      };
      if (editing) {
        await apiPut(`/health-programs/${editing._id}`, payload);
      } else {
        await apiPost("/health-programs", payload);
      }
      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
      load();
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to save program"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this program?")) return;
    try {
      await apiDelete(`/health-programs/${id}`);
      load();
    } catch (err) {
      alert(getApiErrorMessage(err, "Delete failed"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Health Programs</h1>
          <p className="text-sm text-slate-400">Manage online, residential, and day visitor programs.</p>
        </div>
        <button
          onClick={startCreate}
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg transition"
        >
          <PlusIcon className="h-5 w-5" />
          Add Program
        </button>
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm">Loading...</p>
      ) : items.length === 0 ? (
        <div className="text-slate-400 text-sm bg-slate-900 border border-slate-800 rounded-lg p-6">
          No programs yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item._id} className="rounded-xl border border-white/10 bg-[#0f131a] p-4 space-y-3 shadow-sm">
              <div className="rounded-lg overflow-hidden bg-slate-800 h-32 border border-slate-800">
                {item.coverImage ? (
                  <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">No image</div>
                )}
              </div>
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <p className="text-white font-semibold line-clamp-2">{item.title}</p>
                  <p className="text-xs text-slate-400">{item.slug}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      item.isPublished ? "bg-green-900/60 text-green-300" : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {item.isPublished ? "Published" : "Draft"}
                  </span>
                  <PublishToggle
                    status={item.isPublished ? "published" : "draft"}
                    onToggle={() => togglePublish(item)}
                    disabled={updatingId === item._id}
                  />
                </div>
              </div>
              <p className="text-sm text-slate-300 line-clamp-2">{item.shortDescription}</p>
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
          <div className="w-full max-w-5xl max-h-[90vh] bg-[#0f131a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-semibold text-white">{editing ? "Edit" : "Add"} Health Program</h2>
                <p className="text-sm text-slate-400">Standalone programs separate from health packages.</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white text-xl leading-none">
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-slate-300">Title</label>
                  <input name="title" value={form.title} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-slate-300">Slug</label>
                  <input name="slug" value={form.slug} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-slate-300">Short description</label>
                  <input name="shortDescription" value={form.shortDescription} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-slate-300">Duration (days)</label>
                  <input name="durationInDays" type="number" value={form.durationInDays} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-slate-300">Overview</label>
                <div className="bg-slate-900 border border-slate-700 rounded-lg">
                  <ReactQuill
                    theme="snow"
                    value={form.longDescription}
                    onChange={(val) => setForm((prev) => ({ ...prev, longDescription: val }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-300">Available modes</label>
                <div className="flex flex-wrap gap-2">
                  {MODE_OPTIONS.map((m) => {
                    const active = form.modesAvailable.includes(m.value);
                    return (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => toggleMode(m.value)}
                        className={`px-3 py-1 rounded-full border text-xs ${
                          active ? "bg-teal-900/40 border-teal-500 text-teal-200" : "bg-slate-900 border-slate-700 text-slate-300"
                        }`}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["online", "residential", "dayVisitor"].map((key) => (
                  <div key={key} className="space-y-1">
                    <label className="text-sm text-slate-300 capitalize">{key} price (USD)</label>
                    <input
                      name={`pricing.${key}`}
                      type="number"
                      value={form.pricing[key]}
                      onChange={handleChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-slate-300">Inclusions</label>
                    <button onClick={() => addListField("inclusions")} className="text-xs text-teal-300">+ Add</button>
                  </div>
                  <div className="space-y-2">
                    {form.inclusions.map((val, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          value={val}
                          onChange={(e) => updateListField("inclusions", idx, e.target.value)}
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                          placeholder="Inclusion"
                        />
                        {form.inclusions.length > 1 && (
                          <button
                            onClick={() => removeListField("inclusions", idx)}
                            className="px-3 py-2 rounded-lg bg-red-900/50 text-red-100"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-slate-300">Outcomes</label>
                    <button onClick={() => addListField("outcomes")} className="text-xs text-teal-300">+ Add</button>
                  </div>
                  <div className="space-y-2">
                    {form.outcomes.map((val, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          value={val}
                          onChange={(e) => updateListField("outcomes", idx, e.target.value)}
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                          placeholder="Outcome"
                        />
                        {form.outcomes.length > 1 && (
                          <button
                            onClick={() => removeListField("outcomes", idx)}
                            className="px-3 py-2 rounded-lg bg-red-900/50 text-red-100"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-300">Cover image</label>
                  <MediaUploader
                    accept="image/*"
                    maxItems={1}
                    value={form.coverImage ? [form.coverImage] : []}
                    onChange={(list) => setForm((prev) => ({ ...prev, coverImage: list[0] || "" }))}
                  />
                </div>
                <MediaSection
                  title="Gallery & promo videos"
                  images={form.galleryImages}
                  setImages={(list) => setForm((prev) => ({ ...prev, galleryImages: list.slice(0, 10) }))}
                  videos={form.promoVideos}
                  setVideos={(list) => setForm((prev) => ({ ...prev, promoVideos: list.slice(0, 3) }))}
                  maxImages={10}
                  maxVideos={3}
                  showVideoUpload={false}
                />
                <div className="space-y-1">
                  <label className="text-sm text-slate-300">YouTube link (optional)</label>
                  <input
                    type="text"
                    value={form.videoUrl}
                    onChange={(e) => setForm((prev) => ({ ...prev, videoUrl: e.target.value }))}
                    placeholder="Paste a YouTube URL"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <input type="checkbox" name="isPublished" checked={form.isPublished} onChange={handleChange} />
                <label className="text-sm text-slate-300">Published</label>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3">
              <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg bg-slate-800 text-white">
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-teal-600 text-white disabled:opacity-60"
              >
                {saving ? "Saving..." : editing ? "Save changes" : "Create Program"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
