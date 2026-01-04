"use client";

import { useEffect, useState } from "react";
import { apiPut } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errorMessage";

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

function statusBadge(status) {
  const map = {
    pending: "bg-yellow-600/30 text-yellow-300 border-yellow-600",
    confirmed: "bg-teal-600/30 text-teal-300 border-teal-600",
    cancelled: "bg-rose-600/30 text-rose-300 border-rose-600",
    completed: "bg-blue-600/30 text-blue-300 border-blue-600",
    rescheduled: "bg-blue-600/30 text-blue-300 border-blue-600",
  };
  const cls = map[status] || map.pending;
  const label = (status || "pending").charAt(0).toUpperCase() + (status || "pending").slice(1);
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border inline-block ml-2 ${cls}`}>
      {label}
    </span>
  );
}

export default function AppointmentDetailModal({
  open,
  onClose,
  appt,
  reload,
}) {
  const [status, setStatus] = useState("pending");
  const [adminMessage, setAdminMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelForm, setCancelForm] = useState({ message: "", notifyPatient: true });
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    date: "",
    time: "",
    doctorId: "",
    message: "",
  });
  const [rescheduleForm, setRescheduleForm] = useState({
    date: "",
    time: "",
    message: "",
  });

  useEffect(() => {
    if (appt) {
      setStatus(appt.status || "pending");
      setAdminMessage(appt.adminMessage || "");
      setCancelForm({ message: "", notifyPatient: true });
      setRescheduleForm({
        date: appt.date ? appt.date.split("T")[0] : "",
        time: appt.time || "",
        message: "",
      });
      setEditForm({
        date: appt.date ? appt.date.split("T")[0] : "",
        time: appt.time || "",
        doctorId: appt.doctorId || appt.doctor?._id || appt.doctorId?._id || "",
        message: appt.message || "",
      });
    }
  }, [appt]);

  if (!open || !appt) return null;

  function formatDateLabel() {
    if (!appt?.date) return "";
    try {
      return new Date(appt.date).toLocaleDateString();
    } catch {
      return appt.date;
    }
  }

  async function updateStatus(
    nextStatus,
    { includeMessage = true, messageOverride = null, requireMessage = false, notifyPatient = undefined } = {}
  ) {
    const desiredStatus =
      typeof nextStatus === "string" && nextStatus
        ? nextStatus
        : typeof nextStatus === "object"
          ? undefined
          : nextStatus;

    if (requireMessage && !messageOverride && !adminMessage) {
      alert("Please add a message for this action.");
      return;
    }

    setLoading(true);
    try {
      const payload = { status: desiredStatus || status };
      if (includeMessage && (messageOverride || adminMessage)) {
        payload.adminMessage = messageOverride || adminMessage;
      }
       if (typeof notifyPatient === "boolean") {
        payload.notifyPatient = notifyPatient;
      }
      await apiPut(`/appointments/${appt._id}/status`, payload);
      reload?.();
      onClose?.();
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to update status"));
    }
    setLoading(false);
  }

  async function handleRescheduleSubmit(e) {
    e.preventDefault();
    if (!rescheduleForm.date && !rescheduleForm.time) {
      alert("Please add a date or time to reschedule.");
      return;
    }
    setLoading(true);
    try {
      await apiPut(`/appointments/${appt._id}/reschedule`, {
        date: rescheduleForm.date || appt.date,
        time: rescheduleForm.time || appt.time,
        status: "rescheduled",
        adminMessage: rescheduleForm.message || "",
      });
      reload?.();
      setShowReschedule(false);
      onClose?.();
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to reschedule"));
    }
    setLoading(false);
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
        <div className="relative w-full max-w-2xl bg-[#0f131a] border border-white/10 rounded-2xl p-6 space-y-4 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-300 hover:text-white bg-slate-700/40 hover:bg-slate-700 rounded-full p-2 transition"
          >
            ✕
          </button>

          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Appointment Details</h2>
            {statusBadge(appt.status)}
          </div>

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
              <label className="text-sm text-slate-300">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rescheduled">Rescheduled</option>
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

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() =>
                  updateStatus("confirmed", {
                    includeMessage: true,
                    messageOverride: `Your appointment on ${formatDateLabel()} at ${formatTime(appt.time || "")} is confirmed.`,
                  })
                }
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-60"
                disabled={loading}
              >
                Confirm
              </button>
              <button
                onClick={() => {
                  setCancelForm({ message: "", notifyPatient: true });
                  setShowCancelModal(true);
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-60"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowReschedule(true)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-60"
                disabled={loading}
              >
                Reschedule
              </button>
              <button
                onClick={() => setShowEdit(true)}
                className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-60"
                disabled={loading}
              >
                Edit
              </button>
              <button
                onClick={() => updateStatus(undefined, { includeMessage: true })}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60"
                disabled={loading}
              >
                Update & Notify
              </button>
            </div>
          </div>
        </div>
      </div>

      {showReschedule && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="relative w-full max-w-md bg-[#0f131a] border border-white/10 rounded-2xl p-5 space-y-3 text-white">
            <button
              onClick={() => setShowReschedule(false)}
              className="absolute top-3 right-3 text-gray-300 hover:text-white"
            >
              ✕
            </button>
            <h3 className="text-lg font-semibold">Reschedule Appointment</h3>
            <form className="space-y-3" onSubmit={handleRescheduleSubmit}>
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
                  onClick={() => setShowReschedule(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-60"
                  disabled={loading}
                >
                  Save & Notify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="relative w-full max-w-md bg-[#0f131a] border border-white/10 rounded-2xl p-5 space-y-3 text-white">
            <button
              onClick={() => setShowCancelModal(false)}
              className="absolute top-3 right-3 text-gray-300 hover:text-white"
            >
              ✕
            </button>
            <h3 className="text-lg font-semibold">Cancel Appointment</h3>
            <p className="text-sm text-slate-300">Provide a reason and choose if the patient is notified.</p>
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!cancelForm.message.trim()) {
                  alert("Please enter a cancellation reason.");
                  return;
                }
                await updateStatus("cancelled", {
                  includeMessage: true,
                  messageOverride: cancelForm.message.trim(),
                  requireMessage: true,
                  notifyPatient: cancelForm.notifyPatient,
                });
                setShowCancelModal(false);
              }}
            >
              <div className="space-y-1">
                <label className="text-sm text-slate-300">Message to patient</label>
                <textarea
                  rows={4}
                  value={cancelForm.message}
                  onChange={(e) => setCancelForm((p) => ({ ...p, message: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  placeholder="Reason for cancellation and any next steps"
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
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-60"
                  disabled={loading}
                >
                  Cancel Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEdit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="relative w-full max-w-md bg-[#0f131a] border border-white/10 rounded-2xl p-5 space-y-3 text-white">
            <button
              onClick={() => setShowEdit(false)}
              className="absolute top-3 right-3 text-gray-300 hover:text-white"
            >
              ✕
            </button>
            <h3 className="text-lg font-semibold">Edit Appointment</h3>
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                try {
                  await apiPut(`/appointments/${appt._id}`, {
                    date: editForm.date || appt.date,
                    time: editForm.time || appt.time,
                    doctorId: editForm.doctorId || appt.doctorId,
                    adminMessage: editForm.message || adminMessage,
                  });
                  reload?.();
                  setShowEdit(false);
                  onClose?.();
                } catch (err) {
                  alert(getApiErrorMessage(err, "Failed to edit appointment"));
                }
                setLoading(false);
              }}
            >
              <div className="space-y-1">
                <label className="text-sm text-slate-300">Date</label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm((p) => ({ ...p, date: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-300">Time</label>
                <input
                  type="time"
                  value={editForm.time}
                  onChange={(e) => setEditForm((p) => ({ ...p, time: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-300">Doctor ID</label>
                <input
                  type="text"
                  value={editForm.doctorId}
                  onChange={(e) => setEditForm((p) => ({ ...p, doctorId: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Doctor ID"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-300">Notes</label>
                <textarea
                  rows={3}
                  value={editForm.message}
                  onChange={(e) => setEditForm((p) => ({ ...p, message: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  placeholder="Update notes"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-60"
                  disabled={loading}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
