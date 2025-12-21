"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import AddAppointmentModal from "@/components/admin/AddAppointmentModal";
import AppointmentDetailModal from "@/components/admin/AppointmentDetailModal";
import { apiGet, apiPut, apiDelete } from "@/lib/api";

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({ date: "", time: "", message: "" });
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelForm, setCancelForm] = useState({ message: "", notifyPatient: true });
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const todayStr = dayjs().format("YYYY-MM-DD");
  const tomorrowStr = dayjs().add(1, "day").format("YYYY-MM-DD");

  function normalizedDate(d) {
    if (!d) return "";
    return dayjs(d).format("YYYY-MM-DD");
  }

  const statusBadge = (status) => {
    const map = {
      pending: "bg-yellow-600/30 text-yellow-300 border-yellow-600",
      confirmed: "bg-teal-600/30 text-teal-300 border-teal-600",
      cancelled: "bg-rose-600/30 text-rose-300 border-rose-600",
      completed: "bg-blue-600/30 text-blue-300 border-blue-600",
      rescheduled: "bg-blue-600/30 text-blue-300 border-blue-600",
    };
    const cls = map[status] || map.pending;
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full border inline-block ml-2 ${cls}`}>
        {(status || "pending").charAt(0).toUpperCase() + (status || "pending").slice(1)}
      </span>
    );
  };

  function doctorLabel(apt) {
    return apt.doctor?.name || apt.doctor || apt.doctorName || "No doctor assigned";
  }

  function formatTime(timeString = "") {
    if (!timeString) return "";
    if (timeString.includes("AM") || timeString.includes("PM")) return timeString;
    try {
      const [hour, minute] = timeString.split(":");
      const h = Number(hour);
      const ampm = h >= 12 ? "PM" : "AM";
      const formatted = ((h + 11) % 12 + 1) + ":" + minute + " " + ampm;
      return formatted;
    } catch {
      return timeString;
    }
  }

  async function loadAppointments() {
    setLoading(true);
    try {
      const res = await apiGet("/appointments");
      const data = res?.data || res || [];
      setAppointments(data);
    } catch (err) {
      console.error("Appointments load error:", err);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  function openAppointmentDetails(appt) {
    setSelectedAppointment(appt);
    setShowDetailsModal(true);
  }

  function openReschedule(appt) {
    setRescheduleTarget(appt);
    setRescheduleForm({
      date: normalizedDate(appt.date),
      time: appt.time || "",
      message: appt.adminMessage || "",
    });
    setShowRescheduleModal(true);
  }

  const todaysAppointments = appointments.filter((a) => normalizedDate(a.date) === todayStr);
  const tomorrowAppointments = appointments.filter(
    (a) => normalizedDate(a.date) === tomorrowStr
  );
  const upcomingPending = appointments.filter((a) => {
    const d = normalizedDate(a.date);
    return a.status === "pending" || (d && d > tomorrowStr);
  });
  const allByDate = [...appointments].sort((a, b) => {
    const da = normalizedDate(a.date);
    const db = normalizedDate(b.date);
    if (da && db) return db.localeCompare(da);
    if (da) return -1;
    if (db) return 1;
    return (b.createdAt || "").localeCompare(a.createdAt || "");
  });

  async function handleStatus(appt, status) {
    try {
      await apiPut(`/appointments/${appt._id}/status`, { status });
      loadAppointments();
    } catch (err) {
      alert(err.message || "Failed to update");
    }
  }

  async function handleDelete(appt) {
    const ok =
      typeof window === "undefined"
        ? true
        : window.confirm(
            `Delete appointment for ${appt.patientName || apt.name || "patient"} on ${normalizedDate(
              appt.date
            ) || "date"}?`
          );
    if (!ok) return;
    try {
      await apiDelete(`/appointments/${appt._id}`);
      loadAppointments();
    } catch (err) {
      alert(err?.message || "Failed to delete appointment");
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-white">Appointments</h1>
          <p className="text-gray-400">Manage all patient bookings</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-500"
        >
          + Add Appointment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0f131a] border border-white/10 rounded-xl p-6 space-y-3">
          <h2 className="text-lg font-semibold text-white">
            Today&apos;s Appointments ({todayStr})
          </h2>
          {loading ? (
            <p className="text-slate-400 text-sm">Loading...</p>
          ) : todaysAppointments.length === 0 ? (
            <p className="text-slate-500 text-sm">No appointments today.</p>
          ) : (
            todaysAppointments.map((apt) => (
              <div
                key={apt._id}
                className="border border-white/5 rounded-lg p-3 hover:border-teal-600/50 transition cursor-pointer"
                onClick={() => openAppointmentDetails(apt)}
              >
                <p className="text-white font-medium hover:text-teal-400 transition">
                  {apt.patientName || apt.name}
                </p>
                <p className="text-slate-400 text-xs">{apt.patientEmail || apt.email}</p>
                <p className="text-slate-400 text-xs flex items-center gap-1">
                  {formatTime(apt.time)} • Dr. {doctorLabel(apt)}
                  {statusBadge(apt.status)}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="bg-[#0f131a] border border-white/10 rounded-xl p-6 space-y-3">
          <h2 className="text-lg font-semibold text-white">
            Next Day&apos;s Appointments ({tomorrowStr})
          </h2>
          {loading ? (
            <p className="text-slate-400 text-sm">Loading...</p>
          ) : tomorrowAppointments.length === 0 ? (
            <p className="text-slate-500 text-sm">No appointments tomorrow.</p>
          ) : (
            tomorrowAppointments.map((apt) => (
              <div
                key={apt._id}
                className="border border-white/5 rounded-lg p-3 hover:border-teal-600/50 transition cursor-pointer"
                onClick={() => openAppointmentDetails(apt)}
              >
                <p className="text-white font-medium hover:text-teal-400 transition">
                  {apt.patientName || apt.name}
                </p>
                <p className="text-slate-400 text-xs">{apt.patientEmail || apt.email}</p>
                <p className="text-slate-400 text-xs flex items-center gap-1">
                  {formatTime(apt.time)} • Dr. {doctorLabel(apt)}
                  {statusBadge(apt.status)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-[#0f131a] border border-white/10 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Upcoming Appointments (Pending Confirmation)</h2>
        {loading ? (
          <p className="text-slate-400 text-sm">Loading...</p>
        ) : upcomingPending.length === 0 ? (
          <p className="text-slate-500 text-sm">No pending or upcoming appointments.</p>
        ) : (
          upcomingPending.map((apt) => (
            <div
              key={apt._id}
              className="border border-white/5 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:border-teal-600/50 transition"
            >
              <div>
                <p
                  className="text-white font-semibold hover:text-teal-400 cursor-pointer transition"
                  onClick={() => openAppointmentDetails(apt)}
                >
                  {apt.patientName || apt.name}
                </p>
                <p className="text-slate-400 text-xs">{apt.patientEmail || apt.email}</p>
                <p className="text-slate-400 text-xs">
                  {normalizedDate(apt.date)} · {formatTime(apt.time)} • Dr. {doctorLabel(apt)}
                  {statusBadge(apt.status)}
                </p>
                <p className="text-slate-500 text-xs">
                  {apt.service || apt.departmentName || "Department"} · {apt.doctor || apt.doctorName || "Doctor"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleStatus(apt, "confirmed")}
                  className="px-3 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-500 text-xs"
                >
                  Confirm
                </button>
                <button
                  onClick={() => {
                    setCancelTarget(apt);
                    setCancelForm({ message: "", notifyPatient: true });
                    setShowCancelModal(true);
                  }}
                  className="px-3 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-500 text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    openReschedule(apt);
                  }}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 text-xs"
                >
                  Reschedule
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <AddAppointmentModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSaved={() => {
          loadAppointments();
        }}
      />
      {showCancelModal && cancelTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="relative w-full max-w-md bg-[#0f131a] border border-white/10 rounded-2xl p-5 space-y-3 text-white">
            <button
              onClick={() => setShowCancelModal(false)}
              className="absolute top-3 right-3 text-gray-300 hover:text-white"
            >
              ✕
            </button>
            <h3 className="text-lg font-semibold">Cancel Appointment</h3>
            <p className="text-sm text-slate-300">
              Please provide a reason. You can choose whether to email the patient.
            </p>
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!cancelForm.message.trim()) {
                  alert("Please enter a cancellation reason.");
                  return;
                }
                try {
                  await apiPut(`/appointments/${cancelTarget._id}/status`, {
                    status: "cancelled",
                    adminMessage: cancelForm.message.trim(),
                    notifyPatient: cancelForm.notifyPatient,
                  });
                  loadAppointments();
                  setShowCancelModal(false);
                  setCancelTarget(null);
                  setCancelForm({ message: "", notifyPatient: true });
                } catch (err) {
                  alert(err?.message || "Failed to cancel");
                }
              }}
            >
              <div className="space-y-1">
                <label className="text-sm text-slate-300">Message to patient</label>
                <textarea
                  rows={4}
                  value={cancelForm.message}
                  onChange={(e) => setCancelForm((p) => ({ ...p, message: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  placeholder="Provide cancellation reason and next steps"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={cancelForm.notifyPatient}
                  onChange={(e) => setCancelForm((p) => ({ ...p, notifyPatient: e.target.checked }))}
                  className="rounded border-slate-600 bg-slate-800"
                />
                Notify patient via email
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500"
                >
                  Cancel Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-[#0f131a] border border-white/10 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">All Appointments</h2>
          <p className="text-xs text-slate-400">Includes past, cancelled, and confirmed</p>
        </div>
        {loading ? (
          <p className="text-slate-400 text-sm">Loading...</p>
        ) : allByDate.length === 0 ? (
          <p className="text-slate-500 text-sm">No appointments found.</p>
        ) : (
          allByDate.map((apt) => (
            <div
              key={apt._id}
              className="border border-white/5 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:border-teal-600/50 transition"
            >
              <div>
                <p className="text-white font-semibold">{apt.patientName || apt.name}</p>
                <p className="text-slate-400 text-xs">{apt.patientEmail || apt.email}</p>
                <p className="text-slate-400 text-xs flex items-center gap-1">
                  {normalizedDate(apt.date) || "No date"} · {formatTime(apt.time)} • Dr. {doctorLabel(apt)}
                  {statusBadge(apt.status)}
                </p>
                <p className="text-slate-500 text-xs">
                  {apt.service || apt.departmentName || "Department"} · {apt.doctor || apt.doctorName || "Doctor"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleStatus(apt, "confirmed")}
                  className="px-3 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-500 text-xs"
                >
                  Confirm
                </button>
                <button
                  onClick={() => {
                    setCancelTarget(apt);
                    setCancelForm({ message: "", notifyPatient: true });
                    setShowCancelModal(true);
                  }}
                  className="px-3 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-500 text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={() => openReschedule(apt)}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 text-xs"
                >
                  Reschedule
                </button>
                <button
                  onClick={() => handleDelete(apt)}
                  className="px-3 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showRescheduleModal && rescheduleTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="relative w-full max-w-md bg-[#0f131a] border border-white/10 rounded-2xl p-5 space-y-3 text-white">
            <button
              onClick={() => setShowRescheduleModal(false)}
              className="absolute top-3 right-3 text-gray-300 hover:text-white"
            >
              ✕
            </button>
            <h3 className="text-lg font-semibold">Reschedule Appointment</h3>
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!rescheduleForm.date && !rescheduleForm.time) {
                  alert("Please add a new date or time.");
                  return;
                }
                try {
                  await apiPut(`/appointments/${rescheduleTarget._id}/reschedule`, {
                    date: rescheduleForm.date || rescheduleTarget.date,
                    time: rescheduleForm.time || rescheduleTarget.time,
                    status: "rescheduled",
                    adminMessage: rescheduleForm.message || rescheduleTarget.adminMessage || "",
                    notifyPatient: true,
                  });
                  loadAppointments();
                  setShowRescheduleModal(false);
                  setRescheduleTarget(null);
                  setRescheduleForm({ date: "", time: "", message: "" });
                } catch (err) {
                  alert(err?.message || "Failed to reschedule");
                }
              }}
            >
              <div className="space-y-1">
                <label className="text-sm text-slate-300">New Date</label>
                <input
                  type="date"
                  value={rescheduleForm.date}
                  onChange={(e) => setRescheduleForm((p) => ({ ...p, date: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-300">New Time</label>
                <input
                  type="time"
                  value={rescheduleForm.time}
                  onChange={(e) => setRescheduleForm((p) => ({ ...p, time: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-300">Message to patient</label>
                <textarea
                  rows={3}
                  value={rescheduleForm.message}
                  onChange={(e) => setRescheduleForm((p) => ({ ...p, message: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  placeholder="Share the updated schedule or instructions"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500"
                >
                  Save & Notify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
