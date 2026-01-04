"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import AppointmentCalendar from "@/components/AppointmentCalendar";
import { apiGet, apiPatch } from "@/lib/api";

const statusBadge = (status) => {
  const map = {
    pending: "bg-yellow-600/30 text-yellow-300 border-yellow-600",
    confirmed: "bg-teal-600/30 text-teal-300 border-teal-600",
    cancelled: "bg-rose-600/30 text-rose-300 border-rose-600",
    completed: "bg-blue-600/30 text-blue-300 border-blue-600",
    rescheduled: "bg-blue-600/30 text-blue-300 border-blue-600",
  };
  const cls = map[status] || map.pending;
  const label = (status || "pending").charAt(0).toUpperCase() + (status || "pending").slice(1);
  return <span className={`text-xs px-2 py-0.5 rounded-full border inline-block ${cls}`}>{label}</span>;
};

export default function PackageBookingsCalendar() {
  const [events, setEvents] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState({
    status: "pending",
    preferredStartDate: "",
    peopleCount: 1,
    notes: "",
    adminMessage: "",
  });

  function durationFor(pkgId, pkgList = packages) {
    const pkg = pkgList.find((p) => p._id === pkgId);
    if (!pkg) return 1;
    const dur = Number(pkg.duration);
    return dur > 0 ? dur : 1;
  }

  async function load() {
    try {
      const [bookingsRes, packagesRes] = await Promise.all([apiGet("/package-bookings"), apiGet("/packages")]);
      const bookings = bookingsRes?.data || bookingsRes || [];
      const pkgList = packagesRes?.data || packagesRes || [];
      setPackages(pkgList);

      const mapped = bookings
        .filter((b) => b.preferredStartDate)
        .map((b) => {
          const start = dayjs(b.preferredStartDate).format("YYYY-MM-DD");
          const duration = durationFor(b.packageId, pkgList);
          const durationLabel = duration > 1 ? ` (${duration}d)` : "";
          return {
            id: b._id,
            title: `${b.userName || b.name || "Customer"} – ${b.packageName || "Package"}${durationLabel}`,
            start,
            allDay: true, // force single-day rendering in month view
            extendedProps: { ...b, status: b.status, duration },
          };
        });
      setEvents(mapped);
    } catch (err) {
      console.error("Package booking calendar load error:", err);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openEdit(booking, presetStatus) {
    setSelected(booking);
    setEditForm({
      status: presetStatus || booking.status || "pending",
      preferredStartDate: booking.preferredStartDate || "",
      peopleCount: booking.peopleCount || 1,
      notes: booking.notes || "",
      adminMessage: "",
    });
  }

  async function saveEdit() {
    if (!selected?._id) return;
    if (editForm.status === "cancelled" && !editForm.adminMessage.trim()) {
      alert("Cancellation reason is required");
      return;
    }
    if (editForm.status === "rescheduled" && !editForm.preferredStartDate) {
      alert("Please select a new start date for reschedule");
      return;
    }
    try {
      await apiPatch(`/package-bookings/${selected._id}/status`, {
        status: editForm.status,
        preferredStartDate: editForm.preferredStartDate,
        peopleCount: editForm.peopleCount,
        notes: editForm.notes,
        adminMessage: editForm.adminMessage.trim(),
      });
      setSelected(null);
      load();
    } catch (err) {
      alert(err?.message || "Failed to update booking");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Package Bookings Calendar</h1>
        <p className="text-slate-400 text-sm">View package bookings on the calendar.</p>
      </div>

      <AppointmentCalendar
        events={events}
        onDateSelect={() => {}}
        onEventClick={(info) => {
          setSelected(info.event.extendedProps);
          openEdit(info.event.extendedProps);
        }}
      />

      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-[#0f131a] border border-white/10 rounded-2xl p-6 space-y-4 text-white w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between flex-shrink-0">
              <div>
                <p className="text-sm text-slate-400">Package Booking</p>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  {selected.userName || selected.name || "Customer"} {statusBadge(selected.status)}
                </h3>
                <p className="text-slate-300 text-sm">{selected.packageName || "Package"}</p>
              </div>
              <button onClick={() => setSelected(null)} aria-label="Close">
                ✕
              </button>
            </div>

            <div className="space-y-2 text-sm text-slate-300">
              <p>
                <span className="text-slate-400">Preferred start:</span>{" "}
                {selected.preferredStartDate ? dayjs(selected.preferredStartDate).format("MMM D, YYYY") : "—"}
              </p>
              <p>
                <span className="text-slate-400">Duration:</span> {selected.duration || durationFor(selected.packageId)}{" "}
                days
              </p>
              <p>
                <span className="text-slate-400">People:</span> {selected.peopleCount || 1}
              </p>
              <p>
                <span className="text-slate-400">Email:</span> {selected.email || "No email"}
              </p>
              <p>
                <span className="text-slate-400">Phone:</span> {selected.phone || "—"}
              </p>
              {(selected.createdBy || selected.source) && (
                <p>
                  <span className="text-slate-400">Created via:</span>{" "}
                  {selected.createdBy === "admin" ? "Admin" : "Website"}
                  {selected.source ? ` • ${selected.source}` : ""}
                </p>
              )}
              {selected.notes && (
                <p>
                  <span className="text-slate-400">Notes:</span> {selected.notes}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto min-h-0">
              <div className="space-y-1">
                <label className="text-sm text-slate-300">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {["pending", "confirmed", "rescheduled", "cancelled"].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-300">Preferred Start Date</label>
                <input
                  type="date"
                  value={editForm.preferredStartDate}
                  onChange={(e) => setEditForm((p) => ({ ...p, preferredStartDate: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-300">Number of People</label>
                <input
                  type="number"
                  min={1}
                  value={editForm.peopleCount}
                  onChange={(e) => setEditForm((p) => ({ ...p, peopleCount: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm text-slate-300">Message to customer (required for cancel/reschedule)</label>
                <textarea
                  rows={3}
                  value={editForm.adminMessage}
                  onChange={(e) => setEditForm((p) => ({ ...p, adminMessage: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  placeholder="Notes for customer"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm text-slate-300">Internal Notes</label>
                <textarea
                  rows={3}
                  value={editForm.notes}
                  onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  placeholder="Admin-only notes"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white"
              >
                Close
              </button>
              <button
                onClick={() => openEdit(selected, "rescheduled")}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
              >
                Reschedule
              </button>
              <button
                onClick={() => openEdit(selected, "cancelled")}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
