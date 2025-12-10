"use client";

import { useEffect, useState } from "react";
import { MagnifyingGlassIcon, PlusIcon, UserGroupIcon } from "@heroicons/react/24/solid";
import { apiGet, apiDelete } from "@/lib/api";
import AddDoctorModal from "@/components/admin/AddDoctorModal";
import DoctorCard from "@/components/admin/DoctorCard";

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  async function loadDoctors() {
    setLoading(true);
    try {
      const res = await apiGet("/doctors");
      const data = res?.data || res || [];
      setDoctors(data);
      setFiltered(data);
    } catch (err) {
      console.error("Doctor fetch error:", err);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadDoctors();
  }, []);

  function handleSearch(text) {
    setSearch(text);
    const q = text.toLowerCase();
    const f = doctors.filter((d) => {
      const dept = d?.departmentId?.name || d?.department?.name || "";
      return (
        d.name.toLowerCase().includes(q) ||
        dept.toLowerCase().includes(q)
      );
    });
    setFiltered(f);
  }

  async function handleDelete(id) {
    if (!confirm("Delete this doctor?")) return;
    try {
      await apiDelete(`/doctors/${id}`);
      loadDoctors();
    } catch (err) {
      alert(err.message || "Failed to delete doctor");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl text-white font-semibold flex items-center gap-2">
          <UserGroupIcon className="h-7 w-7 text-teal-400" />
          Manage Doctors
        </h1>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-5 py-2 rounded-lg transition"
        >
          <PlusIcon className="h-5 w-5" />
          Add Doctor
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <MagnifyingGlassIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
        <input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search doctors..."
          className="bg-[#11151c] border border-white/10 text-white rounded-lg py-3 pl-10 pr-3 w-full outline-none focus:border-teal-500"
        />
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 bg-slate-800 rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <UserGroupIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p>No doctors found.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-block mt-4 bg-teal-600 hover:bg-teal-500 text-white px-5 py-2 rounded-lg transition"
          >
            Add First Doctor
          </button>
        </div>
      )}

      {/* Doctors Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((doctor) => (
            <DoctorCard key={doctor._id} doctor={doctor} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <AddDoctorModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSaved={() => {
          setShowAddModal(false);
          loadDoctors();
        }}
      />
    </div>
  );
}
