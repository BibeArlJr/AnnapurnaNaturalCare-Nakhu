"use client";

import { useState, useRef } from "react";

export default function MediaUploader({
  value = [],
  onChange,
  maxItems = 10,
  accept = "*/*",
  allowUrls = false,
  disabled = false,
  onUploadStart,
  onUploadEnd,
  onError,
}) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const inputRef = useRef(null);

  const remaining = Math.max(0, maxItems - value.length);

  const handleFiles = async (files) => {
    if (!files?.length || remaining === 0) return;
    const toUpload = Array.from(files).slice(0, remaining);
    try {
      onUploadStart?.();
      setUploading(true);
      const uploaded = [];
      for (const file of toUpload) {
        const fd = new FormData();
        fd.append("image", file);
        fd.append("folder", "admin-media");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
          method: "POST",
          body: fd,
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Upload failed");
        }
        const data = await res.json();
        const url = data?.secure_url || data?.url;
        if (url) uploaded.push(url);
      }
      if (uploaded.length) {
        onChange?.([...value, ...uploaded].slice(0, maxItems));
      }
    } catch (err) {
      onError?.(err?.message || "Upload failed");
    } finally {
      setUploading(false);
      onUploadEnd?.();
    }
  };

  const removeItem = (idx) => {
    const next = value.filter((_, i) => i !== idx);
    onChange?.(next);
  };

  const addUrl = () => {
    const url = (urlInput || "").trim();
    if (!url || value.length >= maxItems) return;
    onChange?.([...value, url].slice(0, maxItems));
    setUrlInput("");
  };

  return (
    <div className="space-y-2">
      <div
        className={`border border-dashed border-slate-700 rounded-lg p-4 text-center text-slate-300 cursor-pointer bg-slate-900/50 ${
          disabled || uploading ? "opacity-60 cursor-not-allowed" : "hover:border-teal-500"
        }`}
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          if (disabled || uploading) return;
          handleFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          disabled={disabled || uploading}
          onChange={(e) => handleFiles(e.target.files)}
        />
        <p className="text-sm font-medium">Click to upload or drop files</p>
        <p className="text-xs text-slate-500">Max {maxItems} items</p>
        {uploading && <p className="text-xs text-teal-300 mt-2">Uploading...</p>}
      </div>

      {allowUrls && (
        <div className="flex gap-2">
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste media URL"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
            disabled={disabled || uploading || value.length >= maxItems}
          />
          <button
            type="button"
            onClick={addUrl}
            disabled={disabled || uploading || !urlInput || value.length >= maxItems}
            className="px-3 py-2 rounded-lg bg-teal-600 text-white text-sm disabled:opacity-50"
          >
            Add
          </button>
        </div>
      )}

      {value?.length ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {value.map((item, idx) => {
            const url = typeof item === "string" ? item : item?.url || "";
            const isImage = accept.startsWith("image") || (url && url.match(/\.(png|jpe?g|webp)$/i));
            return (
              <div key={`${url || idx}-${idx}`} className="relative rounded-lg overflow-hidden border border-slate-700 bg-slate-900/40">
                {isImage ? (
                  <img src={url} alt={`media-${idx}`} className="w-full h-24 object-cover" />
                ) : (
                  <div className="h-24 flex items-center justify-center text-xs text-slate-200 px-2 break-all">{url}</div>
                )}
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="absolute top-1 right-1 bg-black/70 text-white rounded-full text-xs px-2 py-0.5"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
