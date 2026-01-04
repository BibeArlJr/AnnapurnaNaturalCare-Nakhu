"use client";

import { useEffect, useState } from "react";
import { MagnifyingGlassIcon, PlusIcon, TagIcon } from "@heroicons/react/24/solid";
import { apiGet, apiDelete, apiPatch } from "@/lib/api";
import PackageCard from "@/components/admin/PackageCard";
import AddPackageModal from "@/components/admin/AddPackageModal";
import EditPackageModal from "@/components/admin/EditPackageModal";

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editPkg, setEditPkg] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  async function loadPackages() {
    setLoading(true);
    try {
      const res = await apiGet("/packages?includeDrafts=true");
      const data = res?.data || res || [];
      setPackages(data);
      setFiltered(data);
    } catch (err) {
      console.error("Package fetch error:", err);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadPackages();
  }, []);

  function handleSearch(text) {
    setSearch(text);
    const q = text.toLowerCase();
    const f = packages.filter((p) =>
      (p.name || "").toLowerCase().includes(q) ||
      (p.shortDescription || "").toLowerCase().includes(q)
    );
    setFiltered(f);
  }

  async function handleDelete(id) {
    if (!confirm("Delete this package?")) return;
    try {
      await apiDelete(`/packages/${id}`);
      setPackages((prev) => prev.filter((p) => p._id !== id));
      setFiltered((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.message || "Failed to delete package");
    }
  }

  function syncStatus(id, status) {
    setPackages((prev) => prev.map((p) => (p._id === id ? { ...p, status } : p)));
    setFiltered((prev) => prev.map((p) => (p._id === id ? { ...p, status } : p)));
  }

  async function handleToggleStatus(pkg) {
    const nextStatus = pkg.status === "published" ? "draft" : "published";
    syncStatus(pkg._id, nextStatus);
    setUpdatingId(pkg._id);
    try {
      await apiPatch(`/packages/${pkg._id}/status`, { status: nextStatus });
    } catch (err) {
      syncStatus(pkg._id, pkg.status);
      alert(err.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl text-white font-semibold flex items-center gap-2">
          <TagIcon className="h-7 w-7 text-teal-400" />
          Manage Packages
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-5 py-2 rounded-lg transition"
        >
          <PlusIcon className="h-5 w-5" />
          Add New Package
        </button>
      </div>

      <div className="relative w-full sm:w-80">
        <MagnifyingGlassIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
        <input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search packages..."
          className="bg-[#11151c] border border-white/10 text-white rounded-lg py-3 pl-10 pr-3 w-full outline-none focus:border-teal-500"
        />
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 bg-slate-800 rounded-xl" />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <TagIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p>No packages found.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-block mt-4 bg-teal-600 hover:bg-teal-500 text-white px-5 py-2 rounded-lg transition"
          >
            Add First Package
          </button>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((pkg) => (
            <PackageCard
              key={pkg._id}
              pkg={pkg}
              onDelete={handleDelete}
              onEdit={(p) => setEditPkg(p)}
              onToggleStatus={handleToggleStatus}
              updatingStatus={updatingId === pkg._id}
            />
          ))}
        </div>
      )}

      <AddPackageModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSaved={() => {
          setShowAddModal(false);
          loadPackages();
        }}
      />

      <EditPackageModal
        open={!!editPkg}
        pkg={editPkg}
        onClose={() => setEditPkg(null)}
        onSaved={() => {
          setEditPkg(null);
          loadPackages();
        }}
      />
    </div>
  );
}
