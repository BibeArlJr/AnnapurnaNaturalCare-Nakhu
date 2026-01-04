"use client";

import { useEffect, useState } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import MediaUploader from "@/components/admin/MediaUploader";
import { ArrowUpIcon, ArrowDownIcon, TrashIcon, PhotoIcon } from "@heroicons/react/24/outline";

export default function HeroImagesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiGet("/hero-images");
      const data = res?.data || res || [];
      setItems(data);
    } catch (err) {
      console.error("Hero images load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUploaded = async (list) => {
    const url = list?.[0];
    if (!url || items.length >= 6) return;
    setUploading(true);
    try {
      await apiPost("/hero-images", { url });
      load();
    } catch (err) {
      alert(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const move = (idx, dir) => {
    setItems((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const saveOrder = async () => {
    setSavingOrder(true);
    try {
      await apiPut("/hero-images/reorder", {
        order: items.map((it, idx) => ({ id: it._id, order: idx })),
      });
      load();
    } catch (err) {
      alert(err.message || "Failed to save order");
    } finally {
      setSavingOrder(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this hero image?")) return;
    try {
      await apiDelete(`/hero-images/${id}`);
      setItems((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      alert(err.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Hero Banner Images</h1>
          <p className="text-sm text-slate-400">Upload up to 6 images for the homepage hero slider.</p>
        </div>
        <div className="w-64">
          <MediaUploader
            accept="image/*"
            maxItems={1}
            value={[]}
            disabled={uploading || items.length >= 6}
            onChange={handleUploaded}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm">Loading...</p>
      ) : items.length === 0 ? (
        <div className="border border-slate-800 bg-slate-900 rounded-xl p-6 text-slate-300 flex items-center gap-3">
          <PhotoIcon className="h-8 w-8 text-teal-400" />
          No hero images yet. Upload one to get started.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item, idx) => (
              <div key={item._id} className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
                <div className="aspect-video bg-slate-800">
                  <img src={item.url} alt={item.caption || `Hero ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
                <div className="p-3 flex items-center justify-between gap-2">
                  <div className="text-sm text-slate-200 line-clamp-2">{item.caption || "—"}</div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => move(idx, -1)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700"
                      disabled={idx === 0}
                    >
                      <ArrowUpIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => move(idx, 1)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700"
                      disabled={idx === items.length - 1}
                    >
                      <ArrowDownIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => remove(item._id)}
                      className="p-2 rounded-lg bg-rose-900/50 hover:bg-rose-800 text-rose-100"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <button
              onClick={saveOrder}
              disabled={savingOrder}
              className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-500 disabled:opacity-60"
            >
              {savingOrder ? "Saving..." : "Save order"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
