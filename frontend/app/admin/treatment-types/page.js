"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errorMessage";

export default function TreatmentTypesPage() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiGet("/treatment-types");
      setItems(res?.data || res || []);
    } catch (err) {
      console.error("Treatment types load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await apiPost("/treatment-types", { name: name.trim() });
      setName("");
      await load();
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to add treatment type"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this treatment type?")) return;
    try {
      await apiDelete(`/treatment-types/${id}`);
      await load();
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to delete treatment type"));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Treatment Types</h1>
        <p className="text-sm text-slate-400">Manage reusable treatment type labels for packages.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Treatment type name"
          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          onClick={add}
          disabled={saving}
          className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold transition disabled:opacity-70"
        >
          {saving ? "Adding..." : "Add"}
        </button>
      </div>

      <div className="space-y-2">
        {loading && <p className="text-slate-400 text-sm">Loading...</p>}
        {!loading && items.length === 0 && (
          <p className="text-slate-400 text-sm">No treatment types added yet.</p>
        )}
        {items.map((t) => (
          <div
            key={t._id}
            className="flex justify-between items-center border border-slate-800 rounded-lg px-4 py-3 bg-slate-900"
          >
            <div>
              <p className="text-white font-medium">{t.name}</p>
              <p className="text-xs text-slate-500">{t.slug}</p>
            </div>
            <button
              onClick={() => remove(t._id)}
              className="text-red-400 text-sm hover:text-red-300"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
