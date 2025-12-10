"use client";

import { useEffect, useRef, useState } from "react";
import { XMarkIcon, PhotoIcon } from "@heroicons/react/24/solid";

export default function AddGalleryModal({ open, onClose, onSaved }) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFile(null);
    setPreview(null);
    setCaption("");
    setSubmitting(false);
  }, [open]);

  if (!open) return null;

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
    if (!file) {
      alert("Please select an image to upload.");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (caption) formData.append("caption", caption);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gallery`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Upload failed");
      onSaved?.();
      onClose?.();
    } catch (err) {
      alert(err.message || "Upload failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative bg-[#0f131a] border border-white/10 rounded-xl w-full max-w-xl p-6 space-y-5 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-400 hover:text-white"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-xl font-semibold text-white">Add Gallery Image</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            className="border-2 border-dashed border-slate-700 bg-slate-900/40 rounded-xl p-6 text-center text-slate-300 cursor-pointer hover:border-teal-500 transition"
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
              <div className="flex flex-col items-center gap-2">
                <PhotoIcon className="h-10 w-10 text-slate-500" />
                <p className="font-medium">Drop an image here or click to upload</p>
                <p className="text-xs text-slate-500">PNG, JPG under 5MB</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full max-w-xs h-40 object-cover rounded-lg border border-slate-700"
                />
                <p className="text-xs text-slate-500">Click to replace image</p>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-300">Caption (optional)</label>
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Enter a caption"
              className="w-full px-4 py-3 rounded-lg bg-[#11151c] border border-white/10 text-white outline-none focus:border-teal-500"
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
              {submitting ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
