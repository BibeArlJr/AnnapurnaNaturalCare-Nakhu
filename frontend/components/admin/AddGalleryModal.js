"use client";

import { useEffect, useRef, useState } from "react";
import { XMarkIcon, PhotoIcon, FilmIcon, LinkIcon } from "@heroicons/react/24/solid";
import { apiPost, apiPut, buildApiUrl } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errorMessage";

export default function AddGalleryModal({ open, onClose, onSaved, initialData = null }) {
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [youtubeLinks, setYoutubeLinks] = useState([""]);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle(initialData?.title || "");
    setDescription(initialData?.description || "");
    setImages(initialData?.images || []);
    setVideos(initialData?.videos || []);
    setYoutubeLinks(
      initialData?.youtubeLinks?.length ? initialData.youtubeLinks : [""]
    );
    setUploading(false);
    setToast("");
  }, [open, initialData]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  if (!open) return null;

  async function uploadFiles(files, folder) {
    if (!files?.length) return [];
    setUploading(true);
    try {
      const uploads = await Promise.all(
        files.map(async (file) => {
          const fd = new FormData();
          fd.append("image", file);
          fd.append("folder", folder);
          const res = await fetch(buildApiUrl("/upload"), {
            method: "POST",
            body: fd,
            credentials: "include",
          });
          if (!res.ok) throw new Error("Upload failed");
          const data = await res.json();
          return data.secure_url || data.url;
        })
      );
      return uploads.filter(Boolean);
    } finally {
      setUploading(false);
    }
  }

  async function handleImagesSelected(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const urls = await uploadFiles(files, "gallery-images");
    setImages((prev) => [...prev, ...urls]);
    setToast("Images uploaded");
  }

  async function handleVideosSelected(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const urls = await uploadFiles(files, "gallery-videos");
    setVideos((prev) => [...prev, ...urls]);
    setToast("Videos uploaded");
  }

  function updateYoutubeLink(idx, value) {
    setYoutubeLinks((prev) => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  }

  function addYoutubeField() {
    setYoutubeLinks((prev) => [...prev, ""]);
  }

  function removeYoutubeField(idx) {
    setYoutubeLinks((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const cleanedLinks = youtubeLinks.map((l) => l.trim()).filter(Boolean);
    if (!title.trim()) {
      alert("Title is required");
      return;
    }
    if (!images.length && !videos.length && !cleanedLinks.length) {
      alert("Add at least one image, video, or YouTube link.");
      return;
    }

    const payload = {
      title: title.trim(),
      description,
      images,
      videos,
      youtubeLinks: cleanedLinks,
    };

    try {
      if (initialData?._id) {
        await apiPut(`/gallery/${initialData._id}`, payload);
      } else {
        await apiPost("/gallery", payload);
      }
      setToast("Saved");
      onSaved?.();
      setTimeout(() => onClose?.(), 250);
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to save gallery"));
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative bg-[#0f131a] border border-white/10 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh]">
        {toast && (
          <div className="absolute left-4 top-4 bg-teal-700/20 border border-teal-500/50 text-teal-200 px-3 py-2 rounded-lg text-sm shadow">
            {toast}
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white bg-slate-700/50 rounded-full p-2"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        <div className="px-6 pt-6 pb-3 border-b border-slate-800">
          <h2 className="text-xl font-semibold text-white">
            {initialData ? "Edit Gallery Item" : "Add Gallery Item"}
          </h2>
          <p className="text-sm text-slate-400">Upload photos, videos, or add YouTube links.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 pb-6 pt-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-slate-300">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g. Wellness Retreat Highlights"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate-300">Description</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Short summary"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-300 flex items-center gap-2">
                <PhotoIcon className="h-5 w-5 text-teal-400" /> Images
              </p>
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition"
              >
                Upload Images
              </button>
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              ref={imageInputRef}
              className="hidden"
              onChange={handleImagesSelected}
            />
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {images.map((src) => (
                  <div key={src} className="relative group">
                    <img
                      src={src}
                      alt="Gallery"
                      className="w-full h-28 object-cover rounded-lg border border-slate-700"
                    />
                    <button
                      type="button"
                      className="absolute top-2 right-2 bg-black/70 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition"
                      onClick={() => setImages((prev) => prev.filter((i) => i !== src))}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-300 flex items-center gap-2">
                <FilmIcon className="h-5 w-5 text-teal-400" /> Videos
              </p>
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition"
              >
                Upload Videos
              </button>
            </div>
            <input
              type="file"
              accept="video/*"
              multiple
              ref={videoInputRef}
              className="hidden"
              onChange={handleVideosSelected}
            />
            {videos.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {videos.map((src) => (
                  <div key={src} className="relative group">
                    <video src={src} className="w-full rounded-lg border border-slate-700" controls />
                    <button
                      type="button"
                      className="absolute top-2 right-2 bg-black/70 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition"
                      onClick={() => setVideos((prev) => prev.filter((i) => i !== src))}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <LinkIcon className="h-5 w-5 text-teal-400" /> YouTube Links
            </div>
            <div className="space-y-2">
              {youtubeLinks.map((link, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    value={link}
                    onChange={(e) => updateYoutubeLink(idx, e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                  <button
                    type="button"
                    onClick={() => removeYoutubeField(idx)}
                    className="text-sm text-rose-300 px-3 py-2 rounded-lg border border-rose-500/30 hover:bg-rose-500/10"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addYoutubeField}
              className="text-sm text-teal-300 px-3 py-2 rounded-lg border border-teal-500/30 hover:bg-teal-500/10"
            >
              Add another link
            </button>
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
            disabled={uploading}
            className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-500 transition disabled:opacity-70"
          >
            {uploading ? "Uploading..." : initialData ? "Save Changes" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
