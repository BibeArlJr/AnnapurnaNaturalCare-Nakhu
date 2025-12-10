"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { apiPost } from "@/lib/api";

export default function AddCategoryModal({ open, onClose, onCategoryCreated }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      await apiPost("/blog/categories", { name });
      onCategoryCreated?.();
      setName("");
    } catch (err) {
      alert("Failed to create category");
    }

    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-white/10 rounded-xl w-full max-w-md p-6 space-y-5 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-400 hover:text-white"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-xl font-semibold text-white">Add Blog Category</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-gray-300">Category Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Yoga, Naturopathy, Treatment"
              className="w-full px-4 py-2 rounded-lg bg-[#11151c] border border-white/10 text-white outline-none focus:border-teal-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-500 text-white py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Add Category"}
          </button>
        </form>
      </div>
    </div>
  );
}
