"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon, PencilSquareIcon } from "@heroicons/react/24/solid";
import dynamic from "next/dynamic";
import { apiGet, apiPut } from "@/lib/api";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const inputClasses =
  "w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500";

export default function EditBlogPage({ params }) {
  const router = useRouter();
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [imageUploads, setImageUploads] = useState([]);
  const [videoUploads, setVideoUploads] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [existingVideos, setExistingVideos] = useState([]);
  const [youtubeLinks, setYoutubeLinks] = useState([]);
  const [youtubeInput, setYoutubeInput] = useState("");
  const [removeExistingImages, setRemoveExistingImages] = useState([]);
  const [removeExistingVideos, setRemoveExistingVideos] = useState([]);
  const [removeExistingYoutubeLinks, setRemoveExistingYoutubeLinks] = useState([]);
  const initialImagesRef = useRef([]);
  const initialVideosRef = useRef([]);
  const initialYoutubeRef = useRef([]);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    shortDescription: "",
    content: "",
    categoryId: "",
    status: "draft",
  });

  useEffect(() => {
    loadBlog();
  }, [params?.id]);

  async function loadBlog() {
    setLoading(true);
    setError("");
    try {
      const res = await apiGet(`/blogs/${params.id}`);
      const data = res?.data || res || {};
      setForm({
        title: data.title || "",
        slug: data.slug || "",
        shortDescription: data.shortDescription || "",
        content: data.content || "",
        categoryId: data.categoryId?._id || data.categoryId || "",
        status: data.status || "draft",
      });
      setExistingImages(data.images || []);
      setExistingVideos(data.videos || []);
      setYoutubeLinks(data.youtubeLinks || []);
      initialImagesRef.current = data.images || [];
      initialVideosRef.current = data.videos || [];
      initialYoutubeRef.current = data.youtubeLinks || [];
      await loadCategories();
    } catch (err) {
      setError("Blog not found");
    } finally {
      setLoading(false);
    }
  }

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

  function handleSlugChange(e) {
    setForm((prev) => ({ ...prev, slug: e.target.value }));
  }

  function handleImageSelect(e) {
    const files = Array.from(e.target.files || []);
    const mapped = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setImageUploads((prev) => [...prev, ...mapped]);
  }

  function handleVideoSelect(e) {
    const files = Array.from(e.target.files || []);
    const mapped = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setVideoUploads((prev) => [...prev, ...mapped]);
  }

  function handleImageDrop(e) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;
    const mapped = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setImageUploads((prev) => [...prev, ...mapped]);
  }

  function handleVideoDrop(e) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []).filter((f) => f.type.startsWith("video/"));
    if (!files.length) return;
    const mapped = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setVideoUploads((prev) => [...prev, ...mapped]);
  }

  function addYoutubeLink() {
    const link = youtubeInput.trim();
    if (!link) return;
    setYoutubeLinks((prev) => Array.from(new Set([...prev, link])));
    setYoutubeInput("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.slug) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("slug", form.slug);
      fd.append("categoryId", form.categoryId);
      fd.append("shortDescription", form.shortDescription);
      fd.append("content", form.content);
      fd.append("status", form.status);
      existingImages.forEach((url) => fd.append("images", url));
      existingVideos.forEach((url) => fd.append("videos", url));
      youtubeLinks.forEach((url) => fd.append("youtubeLinks", url));
      removeExistingImages.forEach((url) => fd.append("removeExistingImages", url));
      removeExistingVideos.forEach((url) => fd.append("removeExistingVideos", url));
      removeExistingYoutubeLinks.forEach((url) => fd.append("removeExistingYoutubeLinks", url));
      imageUploads.forEach(({ file }) => fd.append("imageFiles", file));
      videoUploads.forEach(({ file }) => fd.append("videoFiles", file));

      await apiPut(`/blogs/${params.id}`, fd);
      router.push("/admin/blogs");
    } catch (err) {
      setError(err.message || "Failed to update blog");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-[#0f131a] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <button
          onClick={() => router.push("/admin/blogs")}
          className="absolute top-4 right-4 text-gray-300 hover:text-white bg-slate-700/40 hover:bg-slate-700 rounded-full p-2 transition"
        >
          ✕
        </button>

        <div className="px-6 pt-6 pb-3 border-b border-slate-800">
          <h2 className="text-xl font-semibold text-white">Edit Blog Post</h2>
          <p className="text-sm text-slate-400">Update blog content, category, and cover image.</p>
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
                              {categories.find((c) => c._id === form.categoryId)?.name ||
                                "Select category"}
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
                    <Listbox value={form.status} onChange={(v) => setForm((prev) => ({ ...prev, status: v }))}>
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

              <div className="space-y-3">
                <div className="space-y-5">
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-300">Images</p>
                      {imageUploads.length > 0 && (
                        <button
                          type="button"
                          className="text-xs text-rose-300 hover:text-rose-200"
                          onClick={() => setImageUploads([])}
                        >
                          Clear new uploads
                        </button>
                      )}
                    </div>
                    <div
                      className="border-2 border-dashed border-slate-700 bg-slate-900/40 rounded-xl p-4 flex flex-col gap-3 items-center justify-center text-slate-300 cursor-pointer hover:border-teal-500 transition"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleImageDrop}
                      onClick={() => imageInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        ref={imageInputRef}
                        className="hidden"
                        onChange={handleImageSelect}
                      />
                      <div className="text-center space-y-1">
                        <p className="font-medium">Drop images here or click to upload</p>
                        <p className="text-xs text-slate-500">JPG/PNG, multiple allowed.</p>
                      </div>
                      {(existingImages.length > 0 || imageUploads.length > 0) && (
                        <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-3">
                          {existingImages.map((url) => (
                            <div key={url} className="relative group">
                              <img
                                src={url}
                                alt="Existing"
                                className="w-full h-24 object-cover rounded-lg border border-slate-700"
                              />
                              <button
                                type="button"
                                className="absolute top-1 right-1 bg-black/70 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExistingImages((prev) => prev.filter((img) => img !== url));
                                  if (initialImagesRef.current.includes(url)) {
                                    setRemoveExistingImages((prev) => [...prev, url]);
                                  }
                                }}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          {imageUploads.map(({ preview }, idx) => (
                            <div key={preview} className="relative group">
                              <img
                                src={preview}
                                alt="Upload"
                                className="w-full h-24 object-cover rounded-lg border border-slate-700"
                              />
                              <button
                                type="button"
                                className="absolute top-1 right-1 bg-black/70 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setImageUploads((prev) => prev.filter((_, i) => i !== idx));
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

                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-300">Videos</p>
                      {videoUploads.length > 0 && (
                        <button
                          type="button"
                          className="text-xs text-rose-300 hover:text-rose-200"
                          onClick={() => setVideoUploads([])}
                        >
                          Clear new uploads
                        </button>
                      )}
                    </div>
                    <div
                      className="border-2 border-dashed border-slate-700 bg-slate-900/40 rounded-xl p-4 flex flex-col gap-3 items-center justify-center text-slate-300 cursor-pointer hover:border-teal-500 transition"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleVideoDrop}
                      onClick={() => videoInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        accept="video/*"
                        multiple
                        ref={videoInputRef}
                        className="hidden"
                        onChange={handleVideoSelect}
                      />
                      <div className="text-center space-y-1">
                        <p className="font-medium">Drop videos here or click to upload</p>
                        <p className="text-xs text-slate-500">MP4 recommended, multiple allowed.</p>
                      </div>
                      {(existingVideos.length > 0 || videoUploads.length > 0) && (
                        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3">
                          {existingVideos.map((url) => (
                            <div key={url} className="relative group">
                              <video src={url} className="w-full rounded-lg border border-slate-700" controls />
                              <button
                                type="button"
                                className="absolute top-2 right-2 bg-black/70 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExistingVideos((prev) => prev.filter((vid) => vid !== url));
                                  if (initialVideosRef.current.includes(url)) {
                                    setRemoveExistingVideos((prev) => [...prev, url]);
                                  }
                                }}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          {videoUploads.map(({ preview }, idx) => (
                            <div key={preview} className="relative group">
                              <video src={preview} className="w-full rounded-lg border border-slate-700" controls />
                              <button
                                type="button"
                                className="absolute top-2 right-2 bg-black/70 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setVideoUploads((prev) => prev.filter((_, i) => i !== idx));
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

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-300">YouTube Links</p>
                      {youtubeLinks.length > 0 && (
                        <button
                          type="button"
                          className="text-xs text-rose-300 hover:text-rose-200"
                          onClick={() => {
                            setYoutubeLinks([]);
                            setRemoveExistingYoutubeLinks(initialYoutubeRef.current);
                          }}
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <input
                        value={youtubeInput}
                        onChange={(e) => setYoutubeInput(e.target.value)}
                        className={inputClasses}
                        placeholder="Paste YouTube link"
                      />
                      <button
                        type="button"
                        onClick={addYoutubeLink}
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
                              onClick={(e) => {
                                e.stopPropagation();
                                setYoutubeLinks((prev) => prev.filter((l) => l !== link));
                                if (initialYoutubeRef.current.includes(link)) {
                                  setRemoveExistingYoutubeLinks((prev) => [...prev, link]);
                                }
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
              </div>
            </>
          )}
        </form>

        <div className="mt-auto border-t border-slate-800 bg-[#0b1017] px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/blogs")}
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
