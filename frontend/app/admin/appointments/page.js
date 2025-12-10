"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import AppointmentCalendar from "@/components/AppointmentCalendar";
import AppointmentList from "@/components/AppointmentList";
import AddAppointmentModal from "@/components/admin/AddAppointmentModal";
import { apiGet } from "@/lib/api";

export default function AdminAppointmentsPage() {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [dailyAppointments, setDailyAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Load all appointments for calendar
  async function loadEvents() {
    try {
      const res = await apiGet("/appointments");
      const data = res?.data || res || [];
      const formatted = data.map((a) => ({
        id: a._id,
        title: a.patientName,
        date: dayjs(a.date).format("YYYY-MM-DD"),
      }));
      setEvents(formatted);
    } catch (err) {
      console.error("Calendar load error:", err);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  // Load daily appointments
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

      {/* DAILY APPOINTMENTS ABOVE THE CALENDAR */}
      <div>
        <AppointmentList date={selectedDate} appointments={dailyAppointments} loading={loading} />
      </div>

      {/* CALENDAR */}
      <AppointmentCalendar
        events={events}
        onDateSelect={(d) => setSelectedDate(d)}
      />

      {/* Modal */}
      <AddAppointmentModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSaved={() => {
          loadEvents();
          loadDaily(selectedDate);
        }}
      />
    </div>
  );
}
