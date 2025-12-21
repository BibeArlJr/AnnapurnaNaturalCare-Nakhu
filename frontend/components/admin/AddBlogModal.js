"use client";

import { useEffect, useRef, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon, PencilSquareIcon } from "@heroicons/react/24/solid";
import { apiGet, apiPost } from "@/lib/api";
import AddCategoryModal from "@/components/admin/AddCategoryModal";
import { getApiErrorMessage } from "@/lib/errorMessage";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function AddBlogModal({ open, onClose, onSaved }) {
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [showToast, setShowToast] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [youtubeInput, setYoutubeInput] = useState("");
  const [youtubeLinks, setYoutubeLinks] = useState([]);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    categoryId: "",
    content: "",
    shortDescription: "",
  });

  const inputClasses =
    "w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500";

  useEffect(() => {
    if (open) {
      setForm({
        title: "",
        slug: "",
        categoryId: "",
        content: "",
        shortDescription: "",
      });
      setImagePreviews([]);
      setVideoPreviews([]);
      setImageFiles([]);
      setVideoFiles([]);
      setYoutubeLinks([]);
      setYoutubeInput("");
      setSubmitting(false);
      setShowToast("");
      loadCategories();
    }
  }, [open]);

  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => setShowToast(""), 2200);
    return () => clearTimeout(t);
  }, [showToast]);

  async function loadCategories() {
    try {
      const res = await apiGet("/blog/categories");
      const data = res?.data || res || [];
      setCategories(data);
    } catch (err) {
      console.error("Category fetch error:", err);
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleTitleChange(e) {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setForm((prev) => ({ ...prev, title, slug }));
  }

  function handleImageChange(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setImageFiles((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  }

  function handleVideoChange(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setVideoFiles((prev) => [...prev, ...files]);
    setVideoPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  }

  function handleAddYoutube() {
    const link = youtubeInput.trim();
    if (!link) return;
    setYoutubeLinks((prev) => Array.from(new Set([...prev, link])));
    setYoutubeInput("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.categoryId) {
      alert("Title and category are required.");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("slug", form.slug);
      fd.append("categoryId", form.categoryId);
      fd.append("content", form.content);
      fd.append("shortDescription", form.shortDescription);
      imageFiles.forEach((f) => fd.append("imageFiles", f));
      videoFiles.forEach((f) => fd.append("videoFiles", f));
      youtubeLinks.forEach((link) => fd.append("youtubeLinks", link));

      await apiPost("/blogs", fd);

      setShowToast("Post created");
      onSaved?.();
      setTimeout(() => onClose?.(), 400);
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to save blog"));
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0d1218] border border-slate-800 rounded-2xl shadow-2xl flex flex-col">
        {showToast && (
          <div className="absolute left-5 top-4 bg-teal-600/15 border border-teal-500/50 text-teal-200 px-3 py-2 rounded-lg text-sm shadow">
            {showToast}
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-white bg-slate-700/40 hover:bg-slate-700 rounded-full p-2 transition"
        >
          ✕
        </button>

        <div className="px-6 pt-6 pb-3 border-b border-slate-800">
          <h2 className="text-xl font-semibold text-white">Add Blog Post</h2>
          <p className="text-sm text-slate-400 mt-1">Create a new article with media and publishing status.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 pb-6 pt-4 space-y-6">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Details</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-slate-300">Title</label>
                <input
                  name="title"
                  required
                  value={form.title}
                  onChange={handleTitleChange}
                  className={inputClasses}
                  placeholder="e.g. 5 Tips for Better Sleep"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-300">Slug</label>
                <div className="relative">
                  <input
                    name="slug"
                    required
                    value={form.slug}
                    onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                    className={inputClasses}
                    placeholder="5-tips-for-better-sleep"
                  />
                  <PencilSquareIcon className="h-5 w-5 text-slate-500 absolute right-3 top-3.5" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-300">Category</label>
                <div className="relative mt-1">
                  <Listbox
                    value={form.categoryId}
                    onChange={(v) => setForm((prev) => ({ ...prev, categoryId: v }))}
                  >
                    <div className="relative">
                      <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 pr-10 text-left text-white focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <span>
                          {categories.find((c) => c._id === form.categoryId)?.name || "Select category"}
                        </span>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                        </span>
                      </Listbox.Button>
                      <Transition
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Listbox.Options className="absolute mt-2 max-h-60 w-full overflow-auto rounded-xl bg-slate-900 shadow-xl border border-slate-700 text-white focus:outline-none z-30">
                          {categories.map((cat) => (
                            <Listbox.Option
                              key={cat._id}
                              value={cat._id}
                              className={({ active }) =>
                                `cursor-pointer select-none px-4 py-2 ${
                                  active ? "bg-teal-700/70 text-white" : "text-gray-200"
                                }`
                              }
                            >
                              {({ selected }) => (
                                <div className="flex items-center justify-between">
                                  <span className={selected ? "font-semibold" : ""}>{cat.name}</span>
                                  {selected && <CheckIcon className="h-5 w-5 text-teal-300" />}
                                </div>
                              )}
                            </Listbox.Option>
                          ))}
                          {categories.length === 0 && (
                            <div className="px-4 py-2 text-sm text-slate-400">No categories</div>
                          )}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </Listbox>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-300">Short Description</label>
                <input
                  name="shortDescription"
                  value={form.shortDescription}
                  onChange={handleInputChange}
                  className={inputClasses}
                  placeholder="Brief summary for cards and previews."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Content</label>
              <ReactQuill
                theme="snow"
                value={form.content}
                onChange={(value) => setForm((prev) => ({ ...prev, content: value }))}
                placeholder="Write your post content..."
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ["bold", "italic", "underline"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["link"],
                    ["clean"],
                  ],
                }}
              />
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Media</p>

            {/* Image Upload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-300">Image Upload</p>
                {imagePreviews.length > 0 && (
                  <button
                    type="button"
                    className="text-xs text-rose-300 hover:text-rose-200"
                    onClick={() => {
                      setImageFiles([]);
                      setImagePreviews([]);
                    }}
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div
                className="border-2 border-dashed border-slate-700 bg-slate-900/40 rounded-xl p-4 flex flex-col gap-3 items-center justify-center text-slate-300 cursor-pointer hover:border-teal-500 transition"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const dropped = Array.from(e.dataTransfer.files || []).filter((f) =>
                    f.type.startsWith("image/")
                  );
                  if (!dropped.length) return;
                  setImageFiles((prev) => [...prev, ...dropped]);
                  setImagePreviews((prev) => [...prev, ...dropped.map((f) => URL.createObjectURL(f))]);
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleImageChange}
                />
                <div className="text-center space-y-1">
                  <p className="font-medium">Drop an image here or click to upload</p>
                  <p className="text-xs text-slate-500">JPG or PNG under 5MB. Multiple allowed.</p>
                </div>
                {imageFiles.length > 0 && (
                  <p className="text-xs text-teal-300">
                    {imageFiles.length} image{imageFiles.length > 1 ? "s" : ""} selected
                  </p>
                )}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 w-full">
                    {imagePreviews.map((src, idx) => (
                      <div key={src} className="relative group">
                        <img
                          src={src}
                          alt="Preview"
                          className="w-full h-24 object-cover rounded-lg border border-slate-700"
                        />
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-black/70 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImageFiles((prev) => prev.filter((_, i) => i !== idx));
                            setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Video Upload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-300">Video Upload</p>
                {videoPreviews.length > 0 && (
                  <button
                    type="button"
                    className="text-xs text-rose-300 hover:text-rose-200"
                    onClick={() => {
                      setVideoFiles([]);
                      setVideoPreviews([]);
                    }}
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div
                className="border-2 border-dashed border-slate-700 bg-slate-900/40 rounded-xl p-4 flex flex-col gap-3 items-center justify-center text-slate-300 cursor-pointer hover:border-teal-500 transition"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const dropped = Array.from(e.dataTransfer.files || []).filter((f) =>
                    f.type.startsWith("video/")
                  );
                  if (!dropped.length) return;
                  setVideoFiles((prev) => [...prev, ...dropped]);
                  setVideoPreviews((prev) => [...prev, ...dropped.map((f) => URL.createObjectURL(f))]);
                }}
                onClick={() => videoInputRef.current?.click()}
              >
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  ref={videoInputRef}
                  className="hidden"
                  onChange={handleVideoChange}
                />
                <div className="text-center space-y-1">
                  <p className="font-medium">Drop a video here or click to upload</p>
                  <p className="text-xs text-slate-500">MP4, under 100MB. Multiple allowed.</p>
                </div>
                {videoFiles.length > 0 && (
                  <p className="text-xs text-teal-300">
                    {videoFiles.length} video{videoFiles.length > 1 ? "s" : ""} selected
                  </p>
                )}
                {videoPreviews.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                    {videoPreviews.map((src, idx) => (
                      <div key={src} className="relative group">
                        <video
                          className="w-full rounded-lg border border-slate-700"
                          controls
                          src={src}
                        />
                        <button
                          type="button"
                          className="absolute top-2 right-2 bg-black/70 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition"
                          onClick={(e) => {
                            e.stopPropagation();
                            setVideoFiles((prev) => prev.filter((_, i) => i !== idx));
                            setVideoPreviews((prev) => prev.filter((_, i) => i !== idx));
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* YouTube Link */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-300">YouTube Link</p>
                {youtubeLinks.length > 0 && (
                  <button
                    type="button"
                    className="text-xs text-rose-300 hover:text-rose-200"
                    onClick={() => setYoutubeLinks([])}
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <input
                  name="youtubeInput"
                  value={youtubeInput}
                  onChange={(e) => setYoutubeInput(e.target.value)}
                  className={inputClasses}
                  placeholder="Paste YouTube link"
                />
                <button
                  type="button"
                  onClick={handleAddYoutube}
                  className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-500 transition"
                >
                  Add
                </button>
              </div>
              {youtubeLinks.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {youtubeLinks.map((link) => (
                    <div key={link} className="relative group w-full aspect-video bg-black/40 rounded-lg border border-slate-700 overflow-hidden">
                      <iframe
                        src={link}
                        className="w-full h-full rounded-lg"
                        title="YouTube preview"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 bg-black/70 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition"
                        onClick={() => setYoutubeLinks((prev) => prev.filter((l) => l !== link))}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
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
            {submitting ? "Saving..." : "Save Post"}
          </button>
        </div>
      </div>

      <AddCategoryModal
        open={showAddCategory}
        onClose={() => setShowAddCategory(false)}
        onCategoryCreated={() => {
          setShowAddCategory(false);
          loadCategories();
        }}
      />
    </div>
  );
}
