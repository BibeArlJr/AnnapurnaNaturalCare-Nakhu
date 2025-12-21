"use client";

import { useEffect, useState } from "react";
import { apiPut } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errorMessage";

function formatTime(timeString) {
  if (!timeString) return "";
  const [hour, minute] = timeString.split(":");
  const h = Number(hour);
  const ampm = h >= 12 ? "PM" : "AM";
  const formatted = ((h + 11) % 12 + 1) + ":" + minute + " " + ampm;
  return formatted;
}

export default function AppointmentDetailsModal({ open, onClose, appt, reload }) {
  const [status, setStatus] = useState("pending");
  const [adminMessage, setAdminMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (appt) {
      setStatus(appt.status || "pending");
      setAdminMessage(appt.adminMessage || "");
    }
  }, [appt]);

  if (!open || !appt) return null;

  async function updateAppointmentStatus() {
    setLoading(true);
    try {
      await apiPut(`/appointments/${appt._id}/status`, { status, adminMessage });
      reload?.();
      onClose?.();
    } catch (err) {
      alert(getApiErrorMessage(err, "Update failed"));
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="relative w-full max-w-2xl bg-[#0f131a] border border-white/10 rounded-2xl p-6 space-y-4 text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-white bg-slate-700/40 hover:bg-slate-700 rounded-full p-2 transition"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold">Appointment Details</h2>

        <div className="space-y-2 text-sm text-slate-300">
          <p>
            <strong>Name:</strong> {appt.patientName || appt.name}
          </p>
          <p>
            <strong>Email:</strong> {appt.patientEmail || appt.email || "—"}
          </p>
          <p>
            <strong>Phone:</strong> {appt.patientPhone || appt.phone || "—"}
          </p>
          <p>
            <strong>Department:</strong> {appt.departmentName || appt.service || "—"}
          </p>
          <p>
            <strong>Doctor:</strong> {appt.doctorName || appt.doctor || "—"}
          </p>
          <p>
            <strong>Date:</strong>{" "}
            {appt.date ? new Date(appt.date).toLocaleDateString() : "—"}
          </p>
          <p>
            <strong>Time:</strong> {formatTime(appt.time || "")}
          </p>
          <p>
            <strong>Status:</strong> {appt.status || "pending"}
          </p>
          <p>
            <strong>Message:</strong> {appt.message || "None"}
          </p>
        </div>

        <div className="space-y-3 border-t border-slate-800 pt-3">
          <div className="space-y-1">
            <label className="text-sm text-slate-300">Update Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirm</option>
              <option value="cancelled">Cancel</option>
              <option value="rescheduled">Reschedule</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-slate-300">Message to user</label>
            <textarea
              value={adminMessage}
              onChange={(e) => setAdminMessage(e.target.value)}
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              placeholder="Message to send to user..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={updateAppointmentStatus}
              className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update & Notify"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
