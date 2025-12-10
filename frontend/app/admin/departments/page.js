"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BuildingOfficeIcon, MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/solid";
import AddDepartmentModal from "./AddDepartmentModal";
import DepartmentCardAdmin from "@/components/DepartmentCardAdmin";
import { apiGet, apiDelete } from "@/lib/api";

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  async function loadDepartments() {
    setLoading(true);
    const res = await apiGet("/departments");
    if (res.success) {
      setDepartments(res.data);
      setFiltered(res.data);
    }
    setLoading(false);
  }

  function handleSearch(text) {
    setSearch(text);
    const f = departments.filter((d) =>
      d.name.toLowerCase().includes(text.toLowerCase())
    );
    setFiltered(f);
  }

  async function handleDelete(id) {
    if (!confirm("Delete this department?")) return;
    const res = await apiDelete(`/departments/${id}`);
    if (res.success) loadDepartments();
    else alert("Failed to delete.");
  }

  useEffect(() => {
    loadDepartments();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl text-white font-semibold flex items-center gap-2">
          <BuildingOfficeIcon className="h-7 w-7 text-teal-400" />
          Manage Departments
        </h1>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-5 py-2 rounded-lg transition"
        >
          <PlusIcon className="h-5 w-5" />
          Add Department
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <MagnifyingGlassIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
        <input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search departments..."
          className="bg-[#11151c] border border-white/10 text-white rounded-lg py-3 pl-10 pr-3 w-full outline-none focus:border-teal-500"
        />
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-slate-800 rounded-xl"></div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <BuildingOfficeIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p>No departments found.</p>
          <button
              onClick={() => setShowAddModal(true)}
              className="inline-block mt-4 bg-teal-600 hover:bg-teal-500 text-white px-5 py-2 rounded-lg"
            >
              Add First Department
            </button>
        </div>
      )}

      {/* Departments Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((dept) => (
            <DepartmentCardAdmin
              key={dept._id}
              dept={dept}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <AddDepartmentModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSaved={() => {
          setShowAddModal(false);
          loadDepartments();
        }}
      />
    </div>
  );
}
