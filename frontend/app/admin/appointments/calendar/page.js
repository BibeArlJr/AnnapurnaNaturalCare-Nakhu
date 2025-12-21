"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import AppointmentCalendar from "@/components/AppointmentCalendar";
import AddAppointmentModal from "@/components/admin/AddAppointmentModal";
import { apiGet, apiPut, apiDelete } from "@/lib/api";

export default function AdminAppointmentsCalendarPage() {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [dailyAppointments, setDailyAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelForm, setCancelForm] = useState({ message: "", notifyPatient: true });

  async function loadEvents() {
    try {
      const res = await apiGet("/appointments");
      const data = res?.data || res || [];
      const formatted = data.map((a) => ({
        id: a._id,
        title: a.patientName || "Appointment",
        start: dayjs(a.date).format("YYYY-MM-DD"),
        extendedProps: {
          ...a,
          date: dayjs(a.date).format("YYYY-MM-DD"),
          doctorName: a.doctor?.name || a.doctor,
          departmentName: a.service?.name || a.service,
        },
      }));
      setEvents(formatted);
    } catch (err) {
      console.error("Calendar load error:", err);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadDaily(date) {
    setLoading(true);
    try {
      const res = await apiGet(`/appointments?date=${date}`);
      const data = res?.data || res || [];
      setDailyAppointments(data);
    } catch (err) {
      console.error("Daily load error:", err);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadDaily(selectedDate);
  }, [selectedDate]);

  function openCancel(appt) {
    setCancelTarget(appt);
    setCancelForm({ message: "", notifyPatient: true });
    setShowCancelModal(true);
  }

  async function handleDelete(appt) {
    const ok =
      typeof window === "undefined"
        ? true
        : window.confirm(
            `Delete appointment for ${appt.patientName || appt.name || "patient"} on ${appt.date || "date"}?`
          );
    if (!ok) return;
    try {
      await apiDelete(`/appointments/${appt._id}`);
      loadEvents();
      loadDaily(selectedDate);
      setShowCancelModal(false);
      setCancelTarget(null);
    } catch (err) {
      alert(err?.message || "Failed to delete");
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-white">Appointments Calendar</h1>
          <p className="text-gray-400">View bookings on the calendar</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-500"
        >
          + Add Appointment
        </button>
      </div>

      <AppointmentCalendar
        events={events}
        onDateSelect={(d) => setSelectedDate(d)}
        onEventClick={(info) => {
          openCancel(info.event.extendedProps);
        }}
      />

      <AddAppointmentModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSaved={() => {
          loadEvents();
          loadDaily(selectedDate);
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
                  loadEvents();
                  loadDaily(selectedDate);
                  setShowCancelModal(false);
                  setCancelTarget(null);
                  setCancelForm({ message: "", notifyPatient: true });
                  setShowDetailsModal(false);
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
                  type="button"
                  onClick={() => handleDelete(cancelTarget)}
                  className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600"
                >
                  Delete
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
    </div>
  );
}
