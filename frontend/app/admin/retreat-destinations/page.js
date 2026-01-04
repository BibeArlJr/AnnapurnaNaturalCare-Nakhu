"use client";

import { useEffect, useMemo, useState } from "react";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errorMessage";

const TABS = [
  { key: "inside_valley", label: "Inside Valley" },
  { key: "outside_valley", label: "Outside Valley" },
];

export default function RetreatDestinationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiGet(`/retreat-destinations?type=${activeTab}`);
      setItems(res?.data || res || []);
    } catch (err) {
      console.error("Retreat destinations load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const addDestination = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await apiPost("/retreat-destinations", { name: name.trim(), type: activeTab });
      setName("");
      load();
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to add destination"));
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditingName(item.name);
  };

  const saveEdit = async () => {
    if (!editingId || !editingName.trim()) {
      setEditingId(null);
      setEditingName("");
      return;
    }
    setSaving(true);
    try {
      await apiPut(`/retreat-destinations/${editingId}`, { name: editingName.trim(), type: activeTab });
      setEditingId(null);
      setEditingName("");
      load();
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to update destination"));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id) => {
    try {
      await apiPatch(`/retreat-destinations/${id}/toggle`);
      setItems((prev) => prev.map((i) => (i._id === id ? { ...i, isActive: !i.isActive } : i)));
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to toggle destination"));
    }
  };

  const removeDestination = async (id) => {
    if (!confirm("Delete this destination?")) return;
    try {
      await apiDelete(`/retreat-destinations/${id}`);
      setItems((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to delete destination"));
    }
  };

  const list = useMemo(() => items || [], [items]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Retreat Destinations</h1>
          <p className="text-sm text-slate-400">Manage destinations by category for retreat programs.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const active = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition ${
                active ? "bg-teal-600 text-white border-teal-500" : "bg-slate-900 border-slate-700 text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Destination name"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            onClick={addDestination}
            disabled={saving}
            className="px-4 py-3 rounded-lg bg-teal-600 text-white hover:bg-teal-500 transition disabled:opacity-70"
          >
            Add
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm">Loading...</p>
      ) : list.length === 0 ? (
        <div className="text-slate-400 text-sm bg-slate-900 border border-slate-800 rounded-lg p-6">
          No destinations in this category yet.
        </div>
      ) : (
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900">
          <div className="grid grid-cols-12 px-4 py-3 text-xs uppercase tracking-wide text-slate-400 border-b border-slate-800">
            <span className="col-span-6">Name</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-4 text-right">Actions</span>
          </div>
          {list.map((item) => {
            const editingRow = editingId === item._id;
            return (
              <div
                key={item._id}
                className="grid grid-cols-12 px-4 py-3 text-sm text-white border-b border-slate-800 last:border-b-0 items-center"
              >
                <div className="col-span-6">
                  {editingRow ? (
                    <input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                      autoFocus
                    />
                  ) : (
                    <span className="font-semibold">{item.name}</span>
                  )}
                </div>
                <div className="col-span-2">
                  <button
                    onClick={() => toggleActive(item._id)}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${
                      item.isActive ? "bg-green-900/60 text-green-300" : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {item.isActive ? "Active" : "Inactive"}
                  </button>
                </div>
                <div className="col-span-4 flex justify-end gap-2">
                  {editingRow ? (
                    <>
                      <button
                        onClick={saveEdit}
                        disabled={saving}
                        className="px-3 py-1 rounded-lg bg-teal-600 text-white text-sm hover:bg-teal-500 disabled:opacity-70"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditingName("");
                        }}
                        className="px-3 py-1 rounded-lg bg-slate-800 text-slate-200 text-sm"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(item)}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeDestination(item._id)}
                        className="px-3 py-1 rounded-lg bg-red-900/60 hover:bg-red-800 text-red-100 text-sm"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
