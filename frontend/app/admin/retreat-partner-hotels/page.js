"use client";

import { useEffect, useMemo, useState } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errorMessage";

const STAR_OPTIONS = [3, 4, 5];

export default function PartnerHotelsAdminPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ location: "", starRating: "", pricePerNight: "", isActive: true });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiGet("/partner-hotels");
      setItems(res?.data || res || []);
    } catch (err) {
      console.error("Partner hotels load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startEdit = (item) => {
    setEditingId(item._id);
    setForm({
      location: item.location || "",
      starRating: item.starRating || "",
      pricePerNight: item.pricePerNight ?? "",
      isActive: item.isActive ?? true,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ location: "", starRating: "", pricePerNight: "", isActive: true });
  };

  const save = async () => {
    if (!form.location.trim()) {
      alert("Location is required");
      return;
    }
    if (!form.starRating) {
      alert("Star rating is required");
      return;
    }
    const payload = {
      location: form.location.trim(),
      starRating: Number(form.starRating),
      pricePerNight: Number(form.pricePerNight) || 0,
      isActive: !!form.isActive,
    };
    setSaving(true);
    try {
      if (editingId) {
        await apiPut(`/partner-hotels/${editingId}`, payload);
      } else {
        await apiPost("/partner-hotels", payload);
      }
      resetForm();
      load();
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to save partner hotel"));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item) => {
    try {
      await apiPut(`/partner-hotels/${item._id}`, { isActive: !item.isActive });
      setItems((prev) => prev.map((i) => (i._id === item._id ? { ...i, isActive: !i.isActive } : i)));
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to update status"));
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this partner hotel?")) return;
    try {
      await apiDelete(`/partner-hotels/${id}`);
      setItems((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to delete partner hotel"));
    }
  };

  const list = useMemo(() => items || [], [items]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Partner Hotels</h1>
          <p className="text-sm text-slate-400">Manage global partner hotel accommodation options for retreats and packages.</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="text-sm text-slate-300">Location</label>
            <input
              value={form.location}
              onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
              placeholder="e.g. Thamel"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-300">Star rating</label>
            <select
              value={form.starRating}
              onChange={(e) => setForm((prev) => ({ ...prev, starRating: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"
            >
              <option value="">Select</option>
              {STAR_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s} ★
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-300">Price per night (USD)</label>
            <input
              type="number"
              min="0"
              value={form.pricePerNight}
              onChange={(e) => setForm((prev) => ({ ...prev, pricePerNight: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-300">Active</label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                className="h-4 w-4"
              />
              <span className="text-sm text-slate-200">{form.isActive ? "Active" : "Inactive"}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-3 rounded-lg bg-teal-600 text-white hover:bg-teal-500 transition disabled:opacity-70"
          >
            {saving ? "Saving..." : editingId ? "Save changes" : "Add partner hotel"}
          </button>
          {editingId && (
            <button onClick={resetForm} className="px-4 py-3 rounded-lg bg-slate-800 text-slate-200">
              Cancel edit
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm">Loading...</p>
      ) : list.length === 0 ? (
        <div className="text-slate-400 text-sm bg-slate-900 border border-slate-800 rounded-lg p-6">
          No partner hotels yet. Add your first option.
        </div>
      ) : (
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900">
          <div className="grid grid-cols-12 px-4 py-3 text-xs uppercase tracking-wide text-slate-400 border-b border-slate-800">
            <span className="col-span-4">Location</span>
            <span className="col-span-2">Star</span>
            <span className="col-span-2">Price / night</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-2 text-right">Actions</span>
          </div>
          {list.map((item) => (
            <div
              key={item._id}
              className="grid grid-cols-12 px-4 py-3 text-sm text-white border-b border-slate-800 last:border-b-0 items-center"
            >
              <div className="col-span-4 font-semibold">{item.location}</div>
              <div className="col-span-2">{item.starRating ? `${item.starRating} ★` : "—"}</div>
              <div className="col-span-2">USD {item.pricePerNight || 0}</div>
              <div className="col-span-2">
                <button
                  onClick={() => toggleActive(item)}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${
                    item.isActive ? "bg-green-900/60 text-green-300" : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {item.isActive ? "Active" : "Inactive"}
                </button>
              </div>
              <div className="col-span-2 flex justify-end gap-2">
                <button
                  onClick={() => startEdit(item)}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(item._id)}
                  className="px-3 py-1 rounded-lg bg-red-900/60 hover:bg-red-800 text-red-100 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
