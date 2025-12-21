"use client";

import { useEffect, useState } from "react";
import { PlusIcon, PhotoIcon } from "@heroicons/react/24/solid";
import { apiGet, apiDelete } from "@/lib/api";
import AddGalleryModal from "@/components/admin/AddGalleryModal";
import GalleryCard from "@/components/admin/GalleryCard";

export default function AdminGalleryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  async function loadGallery() {
    setLoading(true);
    setError("");
    try {
      const res = await apiGet("/gallery");
      const data = res?.data || res || [];
      setItems(data);
    } catch (err) {
      setError("Failed to load gallery");
    }
    setLoading(false);
  }

  useEffect(() => {
    loadGallery();
  }, []);

  async function handleDelete(id) {
    if (!confirm("Delete this gallery item?")) return;
    try {
      await apiDelete(`/gallery/${id}`);
      setItems((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      alert(err.message || "Delete failed");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-white font-semibold flex items-center gap-2">
          <PhotoIcon className="h-7 w-7 text-teal-400" />
          Manage Gallery
        </h1>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-5 py-2 rounded-lg transition"
        >
          <PlusIcon className="h-5 w-5" />
          Add Gallery Item
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-900/20 text-rose-200 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <PhotoIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p>No images found.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-block mt-4 bg-teal-600 hover:bg-teal-500 text-white px-5 py-2 rounded-lg transition"
          >
            Add First Image
          </button>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <GalleryCard
              key={item._id}
              item={item}
              onDelete={handleDelete}
              onEdit={(selected) => {
                setEditingItem(selected);
                setShowAddModal(true);
              }}
            />
          ))}
        </div>
      )}

      <AddGalleryModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSaved={() => {
          setShowAddModal(false);
          loadGallery();
        }}
        initialData={editingItem}
      />
    </div>
  );
}
