"use client";

import { useEffect, useState } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errorMessage";
import { PlusIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import MediaSection from "@/components/admin/MediaSection";
import MediaUploader from "@/components/admin/MediaUploader";
import { PublishToggle } from "@/components/admin/PublishToggle";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const emptyForm = {
  title: "",
  slug: "",
  category: "",
  description: "",
  duration: "",
  certificationInfo: "",
  mode: "online",
  price: "",
  syllabus: [{ topic: "Topic", items: [""] }],
  overview: "",
  detailedDescription: "",
  coverImage: "",
  galleryImages: [],
  promoVideos: [],
  videoUrl: "",
  isPublished: false,
};

export default function CoursesAdminPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
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
      const [courseRes, catRes] = await Promise.all([apiGet("/courses"), apiGet("/course-categories/active")]);
      setItems(courseRes?.data || courseRes || []);
      setCategories(catRes?.data || catRes || []);
    } catch (err) {
      console.error("Courses admin load error:", err);
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
      const updated = await apiPut(`/courses/${item._id}`, { isPublished: !item.isPublished });
      const payload = updated?.data || updated;
      setItems((prev) => prev.map((p) => (p._id === item._id ? { ...p, ...payload } : p)));
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to update publish status"));
    } finally {
      setUpdatingId(null);
    }
  };

  const startCreate = () => {
    setForm({ ...emptyForm, category: categories[0]?._id || "" });
    setHasEditedSlug(false);
    setEditing(null);
    setOpen(true);
  };

  const startEdit = (item) => {
    setEditing(item);
    const promos = Array.isArray(item.promoVideos)
      ? item.promoVideos.map((v) => (typeof v === "string" ? v : v?.url)).filter(Boolean)
      : [];
    const uniquePromos = Array.from(new Set(promos));
    setForm({
      ...emptyForm,
      ...item,
      syllabus: (item.syllabusNormalized || item.syllabus || []).map((s) => ({
        topic: s.topic || s.title || "",
        items: Array.isArray(s.items) ? s.items : s.content ? [s.content] : [],
      })),
      price: item.price ?? "",
      category: item.category?._id || item.category || "",
      overview: item.overview || item.description || "",
      detailedDescription: item.detailedDescription || item.description || "",
      galleryImages: item.galleryImages || [],
      promoVideos: uniquePromos,
      videoUrl: item.videoUrl || uniquePromos[0] || "",
    });
    setHasEditedSlug(true);
    setOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
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

  const addTopic = () => {
    setForm((prev) => ({ ...prev, syllabus: [...prev.syllabus, { topic: "", items: [""] }] }));
  };

  const updateTopic = (idx, value) => {
    setForm((prev) => {
      const next = [...prev.syllabus];
      next[idx].topic = value;
      return { ...prev, syllabus: next };
    });
  };

  const removeTopic = (idx) => {
    setForm((prev) => ({ ...prev, syllabus: prev.syllabus.filter((_, i) => i !== idx) }));
  };

  const addSubItem = (tIdx) => {
    setForm((prev) => {
      const next = [...prev.syllabus];
      const items = next[tIdx].items || [];
      next[tIdx].items = [...items, ""];
      return { ...prev, syllabus: next };
    });
  };

  const updateSubItem = (tIdx, iIdx, value) => {
    setForm((prev) => {
      const next = [...prev.syllabus];
      const items = next[tIdx].items || [];
      items[iIdx] = value;
      next[tIdx].items = items;
      return { ...prev, syllabus: next };
    });
  };

  const removeSubItem = (tIdx, iIdx) => {
    setForm((prev) => {
      const next = [...prev.syllabus];
      next[tIdx].items = next[tIdx].items.filter((_, i) => i !== iIdx);
      return { ...prev, syllabus: next };
    });
  };

  const updateSyllabus = (idx, val) => {
    setForm((prev) => {
      const next = [...prev.syllabus];
      next[idx] = val;
      return { ...prev, syllabus: next };
    });
  };
  const addSyllabus = () => setForm((prev) => ({ ...prev, syllabus: [...prev.syllabus, ""] }));
  const removeSyllabus = (idx) =>
    setForm((prev) => ({ ...prev, syllabus: prev.syllabus.filter((_, i) => i !== idx) }));

  const save = async () => {
    if (!form.title.trim()) {
      alert("Title is required");
      return;
    }
    const overviewText = form.overview.replace(/<[^>]+>/g, " ").trim();
    const wordCount = overviewText ? overviewText.split(/\s+/).filter(Boolean).length : 0;
    if (wordCount > 50) {
      alert("Overview should be 50 words or fewer.");
      return;
    }
    setSaving(true);
    try {
    // validate syllabus
    const validTopics = (form.syllabus || []).filter(
      (t) => t.topic && (t.items || []).some((i) => i && i.trim())
    );
    if (!validTopics.length) {
      alert("Add at least one topic with a sub-topic in the syllabus.");
      setSaving(false);
      return;
    }

    const combinedVideos = [...(form.promoVideos || []), form.videoUrl]
      .map((url) => (typeof url === "string" ? url : url?.url))
      .filter(Boolean);
    const uniqueVideos = Array.from(new Set(combinedVideos));

    const payload = {
      title: form.title,
      slug: form.slug,
      category: form.category || undefined,
      overview: form.overview,
      detailedDescription: form.detailedDescription,
      description: form.detailedDescription || form.overview, // legacy compatibility
      duration: form.duration,
      certificationInfo: form.certificationInfo,
      mode: form.mode,
      price: form.price === "" ? 0 : Number(form.price),
      syllabus: validTopics.map((t) => ({
        topic: t.topic,
        items: (t.items || []).filter((i) => i && i.trim()),
      })),
      coverImage: form.coverImage,
      galleryImages: form.galleryImages,
      promoVideos: uniqueVideos,
      videoUrl: uniqueVideos[0] || "",
      isPublished: form.isPublished,
    };
      if (editing) {
        await apiPut(`/courses/${editing._id}`, payload);
      } else {
        await apiPost("/courses", payload);
      }
      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
      load();
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to save course"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this course?")) return;
    try {
      await apiDelete(`/courses/${id}`);
      load();
    } catch (err) {
      alert(getApiErrorMessage(err, "Delete failed"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Courses</h1>
          <p className="text-sm text-slate-400">Yoga Teacher Training, Online Courses, Sound Healing.</p>
        </div>
        <button
          onClick={startCreate}
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg transition"
        >
          <PlusIcon className="h-5 w-5" />
          Add Course
        </button>
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm">Loading...</p>
      ) : items.length === 0 ? (
        <div className="text-slate-400 text-sm bg-slate-900 border border-slate-800 rounded-lg p-6">No courses yet.</div>
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
                  <p className="text-xs text-slate-400">{item.category}</p>
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
              <p className="text-sm text-slate-300 line-clamp-2">{item.description}</p>
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
                <h2 className="text-xl font-semibold text-white">{editing ? "Edit" : "Add"} Course</h2>
                <p className="text-sm text-slate-400">Courses are separate from health packages and retreats.</p>
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
                  <label className="text-sm text-slate-300">Category</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white"
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {categories.length === 0 && (
                    <p className="text-xs text-teal-200">Create categories first in the Course Categories tab.</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-slate-300">Mode</label>
                  <select name="mode" value={form.mode} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white">
                    <option value="online">Online</option>
                    <option value="residential">Residential</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-slate-300">Duration</label>
                  <input name="duration" value={form.duration} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-slate-300">Price (USD)</label>
                  <input name="price" type="number" value={form.price} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-300">Cover image</label>
                <MediaUploader
                  accept="image/*"
                  maxItems={1}
                  value={form.coverImage ? [form.coverImage] : []}
                  onChange={(list) => setForm((prev) => ({ ...prev, coverImage: list[0] || "" }))}
                />
              </div>

                <div className="space-y-1">
                  <label className="text-sm text-slate-300">Overview (max ~300 words)</label>
                  <div className="bg-slate-900 border border-slate-700 rounded-lg">
                    <ReactQuill
                      theme="snow"
                      value={form.overview}
                      onChange={(val) =>
                        setForm((prev) => {
                          const words = val.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean);
                          if (words.length > 50) return prev; // block input beyond 50 words
                          return { ...prev, overview: val };
                        })
                      }
                    />
                  </div>
                  <p className="text-xs text-slate-400">
                    {form.overview.replace(/<[^>]+>/g, "").trim().split(/\s+/).filter(Boolean).length} / 50 words
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-slate-300">Detailed description</label>
                  <div className="bg-slate-900 border border-slate-700 rounded-lg">
                    <ReactQuill
                      theme="snow"
                      value={form.detailedDescription}
                      onChange={(val) => setForm((prev) => ({ ...prev, detailedDescription: val }))}
                    />
                  </div>
                  <p className="text-xs text-slate-400">
                    {form.detailedDescription.replace(/<[^>]+>/g, "").trim().split(/\s+/).filter(Boolean).length} / 50 words max
                  </p>
                </div>

              <div className="space-y-1">
                <label className="text-sm text-slate-300">Certification info</label>
                <input
                  name="certificationInfo"
                  value={form.certificationInfo}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white"
                />
              </div>

              <MediaSection
                title="Media"
                images={form.galleryImages}
                setImages={(list) => setForm((prev) => ({ ...prev, galleryImages: list }))}
                videos={form.promoVideos}
                setVideos={(list) => setForm((prev) => ({ ...prev, promoVideos: list }))}
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

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-slate-300">Syllabus</label>
                  <button onClick={addTopic} type="button" className="text-xs text-teal-300">
                    + Add topic
                  </button>
                </div>
                <div className="space-y-3">
                  {form.syllabus.map((topic, tIdx) => (
                    <div key={tIdx} className="border border-slate-800 rounded-lg p-3 space-y-2 bg-slate-900">
                      <div className="flex items-start gap-2">
                        <input
                          value={topic.topic}
                          onChange={(e) => updateTopic(tIdx, e.target.value)}
                          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                          placeholder="Topic title"
                        />
                        {form.syllabus.length > 1 && (
                          <button
                            onClick={() => removeTopic(tIdx)}
                            type="button"
                            className="px-2 py-1 rounded-lg bg-red-900/60 text-red-100 text-xs"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-slate-300">Sub-topics</p>
                          <button
                            type="button"
                            onClick={() => addSubItem(tIdx)}
                            className="text-xs text-teal-300"
                          >
                            + Add sub-topic
                          </button>
                        </div>
                        {(topic.items || []).map((item, iIdx) => (
                          <div key={iIdx} className="flex gap-2">
                            <input
                              value={item}
                              onChange={(e) => updateSubItem(tIdx, iIdx, e.target.value)}
                              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                              placeholder="Sub-topic"
                            />
                            {topic.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeSubItem(tIdx, iIdx)}
                                className="px-2 py-2 rounded-lg bg-red-900/60 text-red-100 text-xs"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
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
              <button onClick={save} disabled={saving} className="px-4 py-2 rounded-lg bg-teal-600 text-white disabled:opacity-60">
                {saving ? "Saving..." : editing ? "Save changes" : "Create Course"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
