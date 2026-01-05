"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPatch, apiDelete, apiPut } from "@/lib/api";
import dayjs from "dayjs";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { getApiErrorMessage } from "@/lib/errorMessage";

const STATUS_OPTIONS = ["pending", "confirmed", "cancelled", "rescheduled"];
const statusClasses = {
  pending: "bg-yellow-900/60 text-yellow-200",
  confirmed: "bg-green-900/60 text-green-200",
  cancelled: "bg-red-900/60 text-red-200",
};
const paymentClasses = {
  paid: "bg-emerald-900/60 text-emerald-200",
  pending: "bg-amber-900/60 text-amber-200",
  failed: "bg-red-900/60 text-red-200",
  cancelled: "bg-slate-800 text-slate-300",
};

export default function CourseBookingsAdminPage() {
  const [bookings, setBookings] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    status: "pending",
    paymentStatus: "pending",
    adminMessage: "",
    userName: "",
    email: "",
    phone: "",
    country: "",
    preferredStartDate: "",
    numberOfPeople: 1,
    mode: "",
    pricePerPerson: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const courseMap = useMemo(() => {
    const map = {};
    courses.forEach((p) => {
      map[p._id] = p;
      if (p.slug) map[p.slug] = p;
    });
    return map;
  }, [courses]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [bookingsRes, coursesRes] = await Promise.all([apiGet("/course-bookings"), apiGet("/courses")]);
        const list = bookingsRes?.data || bookingsRes || [];
        setBookings(Array.isArray(list) ? list : []);
        const courseList = coursesRes?.data || coursesRes || [];
        setCourses(Array.isArray(courseList) ? courseList : []);
      } catch (err) {
        console.error("Course bookings load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
    apiPatch("/admin/mark-seen?type=courses").catch(() => {});
  }, []);

  useEffect(() => {
    if (editing) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [editing]);

  const startEdit = (item) => {
    setEditing(item);
    setForm({
      status: item.status || "pending",
      paymentStatus: item.paymentStatus || "pending",
      adminMessage: item.adminMessage || "",
      userName: item.userName || "",
      email: item.email || "",
      phone: item.phone || "",
      country: item.country || "",
      preferredStartDate: item.preferredStartDate ? dayjs(item.preferredStartDate).format("YYYY-MM-DD") : "",
      numberOfPeople: item.numberOfPeople || 1,
      mode: item.mode || "",
      pricePerPerson: item.pricePerPerson || "",
      notes: item.notes || "",
    });
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await apiPut(`/course-bookings/${editing._id}`, form);
      const refreshed = await apiGet("/course-bookings");
      setBookings(refreshed?.data || refreshed || []);
      setEditing(null);
      setForm({
        status: "pending",
        paymentStatus: "pending",
        adminMessage: "",
        userName: "",
        email: "",
        phone: "",
        country: "",
        preferredStartDate: "",
        numberOfPeople: 1,
        mode: "",
        pricePerPerson: "",
        notes: "",
      });
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to update booking"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this booking?")) return;
    try {
      await apiDelete(`/course-bookings/${id}`);
      const refreshed = await apiGet("/course-bookings");
      setBookings(refreshed?.data || refreshed || []);
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to delete booking"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Course Bookings</h1>
        {editing && (
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <PencilSquareIcon className="h-5 w-5" />
            Editing booking for {editing.userName}
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm">Loading...</p>
      ) : bookings.length === 0 ? (
        <p className="text-slate-400 text-sm">No course bookings yet.</p>
      ) : (
        <div className="overflow-hidden border border-slate-800 rounded-xl bg-slate-900">
          <div className="grid grid-cols-12 px-4 py-3 text-xs uppercase tracking-wide text-slate-400 border-b border-slate-800">
            <span className="col-span-2">Booking Date</span>
            <span className="col-span-2">Student</span>
            <span className="col-span-2">Course</span>
            <span className="col-span-2">Total (USD)</span>
            <span className="col-span-1">Status</span>
            <span className="col-span-1">Payment</span>
            <span className="col-span-2 text-right">Actions</span>
          </div>
          {bookings.map((item) => {
            const course = courseMap[item.courseId] || courseMap[item.courseSlug];
            const total = item.totalAmount || item.subtotal;
            return (
              <div
                key={item._id}
                className="grid grid-cols-12 px-4 py-3 text-sm text-white border-b border-slate-800 last:border-b-0 items-center"
              >
                <div className="col-span-2">
                  <p className="text-sm text-slate-200">{item.createdAt ? dayjs(item.createdAt).format("DD MMM YYYY") : "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="font-semibold">{item.userName}</p>
                  <p className="text-xs text-slate-400">{item.email}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-slate-200">{item.courseTitle || course?.title || "—"}</p>
                  {item.mode ? <p className="text-xs text-slate-400 capitalize">Mode: {item.mode}</p> : null}
                </div>
                <div className="col-span-2 text-slate-200">{total ? `$${total}` : "—"}</div>
                <div className="col-span-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      statusClasses[item.status] || "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {item.status || "pending"}
                  </span>
                </div>
                <div className="col-span-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      paymentClasses[item.paymentStatus] || "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {item.paymentStatus || "pending"}
                  </span>
                </div>
                <div className="col-span-2 flex justify-end gap-2">
                  <button
                    onClick={() => startEdit(item)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                    Manage
                  </button>
                  <button
                    onClick={() => remove(item._id)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-red-900/60 hover:bg-red-800 text-red-100 text-sm"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center px-4">
          <div className="w-full max-w-lg bg-[#0f131a] border border-white/10 rounded-2xl shadow-2xl p-0 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">Update booking</h3>
              <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-white text-xl">
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Name</label>
              <input
                value={form.userName}
                onChange={(e) => setForm((prev) => ({ ...prev, userName: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Email</label>
                <input
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Country</label>
                <input
                  value={form.country}
                  onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Preferred start date</label>
                <input
                  type="date"
                  value={form.preferredStartDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, preferredStartDate: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">People</label>
                <input
                  type="number"
                  min={1}
                  value={form.numberOfPeople}
                  onChange={(e) => setForm((prev) => ({ ...prev, numberOfPeople: Number(e.target.value) || 1 }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Mode</label>
                <input
                  value={form.mode}
                  onChange={(e) => setForm((prev) => ({ ...prev, mode: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Price per person (USD)</label>
                <input
                  type="number"
                  value={form.pricePerPerson}
                  onChange={(e) => setForm((prev) => ({ ...prev, pricePerPerson: Number(e.target.value) || 0 }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Payment status</label>
                <select
                  value={form.paymentStatus}
                  onChange={(e) => setForm((prev) => ({ ...prev, paymentStatus: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {["pending", "paid", "failed", "cancelled"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Admin message (optional)</label>
              <textarea
                value={form.adminMessage}
                onChange={(e) => setForm((prev) => ({ ...prev, adminMessage: e.target.value }))}
                rows={3}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Share confirmation, cancellation reason, or reschedule details."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            </div>
            <div className="px-6 py-4 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-500 transition disabled:opacity-70"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
