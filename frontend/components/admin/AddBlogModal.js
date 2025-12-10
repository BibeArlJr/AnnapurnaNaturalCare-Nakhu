"use client";

import { useEffect, useRef, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { PencilSquareIcon, CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/solid";
import { apiGet, apiPost } from "@/lib/api";
import AddCategoryModal from "@/components/admin/AddCategoryModal";

export default function AddBlogModal({ open, onClose, onSaved }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    shortDescription: "",
    content: "",
    categoryId: "",
    status: "draft",
    imageData: "",
  });

  const inputClasses =
    "w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500";

  useEffect(() => {
    if (open) {
      setForm({
        title: "",
        slug: "",
        shortDescription: "",
        content: "",
        categoryId: "",
        status: "draft",
        imageData: "",
      });
      setPreview(null);
      setFileName("");
      setToast("");
      setSubmitting(false);
      loadCategories();
    }
  }, [open]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

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

  function handleSlugChange(e) {
    setForm((prev) => ({ ...prev, slug: e.target.value }));
  }

  function readFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, imageData: reader.result }));
      setPreview(reader.result);
      setFileName(file.name);
    };
    reader.readAsDataURL(file);
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.slug) {
      alert("Title and slug are required.");
      return;
    }

    setSubmitting(true);
    try {
      await apiPost("/blogs", {
        title: form.title,
        slug: form.slug,
        shortDescription: form.shortDescription,
        content: form.content,
        categoryId: form.categoryId,
        status: form.status,
        imageData: form.imageData,
      });
      setToast("Post created");
      onSaved?.();
      setTimeout(() => onClose?.(), 400);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to save blog");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  async function loadCategories() {
    try {
      const res = await apiGet("/blog/categories");
      const data = res?.data || res || [];
      setCategories(data);
    } catch (err) {
      console.error("Category fetch error:", err);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0d1218] border border-slate-800 rounded-2xl shadow-2xl flex flex-col">
        {toast && (
          <div className="absolute left-5 top-4 bg-teal-600/15 border border-teal-500/50 text-teal-200 px-3 py-2 rounded-lg text-sm shadow">
            {toast}
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
          <p className="text-sm text-slate-400 mt-1">
            Create a new article with cover image and publishing status.
          </p>
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
                    onChange={handleSlugChange}
                    className={inputClasses}
                    placeholder="5-tips-for-better-sleep"
                  />
                  <PencilSquareIcon className="h-5 w-5 text-slate-500 absolute right-3 top-3.5" />
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
                <label className="text-sm text-slate-300">Status</label>
                <Listbox
                  value={form.status}
                  onChange={(v) => setForm((prev) => ({ ...prev, status: v }))}
                >
                  <div className="relative mt-1">
                    <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 pr-10 text-left text-white focus:outline-none focus:ring-2 focus:ring-teal-500">
                      <span className="capitalize">{form.status}</span>
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                      </span>
                    </Listbox.Button>
                    <Listbox.Options className="absolute mt-2 max-h-60 w-full overflow-auto rounded-xl bg-slate-900 shadow-xl border border-slate-700 text-white focus:outline-none z-30">
                      {["draft", "published"].map((option) => (
                        <Listbox.Option
                          key={option}
                          value={option}
                          className={({ active }) =>
                            `cursor-pointer select-none px-4 py-2 ${
                              active ? "bg-teal-700/70 text-white" : "text-gray-200"
                            }`
                          }
                        >
                          {({ selected }) => (
                            <div className="flex items-center justify-between">
                              <span className={selected ? "font-semibold capitalize" : "capitalize"}>
                                {option}
                              </span>
                              {selected && <CheckIcon className="h-5 w-5 text-teal-300" />}
                            </div>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </div>
                </Listbox>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-slate-300">Content</label>
              <textarea
                name="content"
                value={form.content}
                onChange={handleInputChange}
                rows={5}
                className={`${inputClasses} resize-none`}
                placeholder="Write your post content..."
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-slate-300">Cover Image</p>
                <p className="text-xs text-slate-500">Drag & drop or click to upload.</p>
              </div>
            </div>

            <div
              className="border-2 border-dashed border-slate-700 bg-slate-900/40 rounded-xl p-4 flex flex-col gap-3 items-center justify-center text-slate-300 cursor-pointer hover:border-teal-500 transition"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="text-center space-y-1">
                <p className="font-medium">Drop an image here or click to upload</p>
                <p className="text-xs text-slate-500">Recommended: landscape, under 5MB. JPG or PNG.</p>
              </div>
              {fileName && <p className="text-xs text-teal-300">Selected: {fileName}</p>}
              {preview && (
                <div className="w-full grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 items-center">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full max-w-[220px] h-32 object-cover rounded-lg border border-slate-700"
                  />
                  <p className="text-sm text-slate-400">
                    This preview will be uploaded to Cloudinary and saved with the blog post.
                  </p>
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
        open={false}
        onClose={() => {}}
        onCategoryCreated={() => {}}
      />
    </div>
  );
}
