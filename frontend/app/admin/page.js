"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import {
  UsersIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  EnvelopeOpenIcon,
  ArrowPathIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    departmentsCount: 0,
    doctorsCount: 0,
    upcomingAppointmentsCount: 0,
    messagesCount: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [tomorrowAppointments, setTomorrowAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const todayDisplay = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [departmentsRes, doctorsRes, appointmentsRes, messagesRes] =
          await Promise.all([
            apiGet("/departments"),
            apiGet("/doctors"),
            apiGet("/appointments"),
            apiGet("/contact"), // contact messages
          ]);

        const departments = departmentsRes?.data || [];
        const doctors = doctorsRes?.data || [];
        const appointments = appointmentsRes?.data || [];
        const messages = messagesRes?.data || [];

        const now = new Date();
        const upcomingAppointments = appointments.filter((a) => {
          if (!a.date) return false;
          const d = new Date(a.date);
          return d >= now;
        });

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split("T")[0];
        const tomorrowList = appointments
          .filter((a) => {
            if (!a.date) return false;
            const dateStr = a.date.split("T")[0] || a.date;
            return dateStr === tomorrowStr;
          })
          .slice(0, 4);

        const recentAppointmentsList = [...appointments]
          .filter((a) => a.date)
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);

        const recentMessagesList = [...messages]
          .filter((m) => m.createdAt)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        setStats({
          departmentsCount: departments.length,
          doctorsCount: doctors.length,
          upcomingAppointmentsCount: upcomingAppointments.length,
          messagesCount: messages.length,
        });
        setRecentAppointments(recentAppointmentsList);
        setRecentMessages(recentMessagesList);
        setTomorrowAppointments(tomorrowList);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-24 bg-slate-900/60 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-900/60 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header today={todayDisplay} />

      {error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-900/20 text-rose-200 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <DashboardStatCard
          icon={BuildingOfficeIcon}
          label="Departments"
          value={stats.departmentsCount}
          hint="Active specialties"
        />
        <DashboardStatCard
          icon={UsersIcon}
          label="Doctors"
          value={stats.doctorsCount}
          hint="Registered consultants"
        />
        <DashboardStatCard
          icon={CalendarDaysIcon}
          label="Upcoming appointments"
          value={stats.upcomingAppointmentsCount}
          hint="From today onwards"
        />
        <DashboardStatCard
          icon={EnvelopeOpenIcon}
          label="Messages"
          value={stats.messagesCount}
          hint="Contact form submissions"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TomorrowAppointments tomorrowAppointments={tomorrowAppointments} />
        <RecentMessages recentMessages={recentMessages} />
      </div>
    </div>
  );
}

function Header({ today }) {
  return (
    <div className="mb-2 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-wide text-teal-400">Admin Dashboard</p>
        <h1 className="text-2xl font-semibold text-slate-50 mt-1">Welcome back</h1>
        <p className="text-sm text-slate-400 mt-1">
          Overview of today&apos;s activity · {today}
        </p>
      </div>
      <div className="flex gap-2">
        <Link
          href="/admin/appointments"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-500 transition"
        >
          <CalendarDaysIcon className="h-4 w-4" />
          View appointments
        </Link>
        <Link
          href="/admin/doctors/new"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 text-slate-100 text-sm font-medium hover:bg-slate-700 transition"
        >
          <PlusCircleIcon className="h-4 w-4" />
          Add doctor
        </Link>
      </div>
    </div>
  );
}

function DashboardStatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-4 flex items-center justify-between gap-3 shadow-sm">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-2xl font-semibold text-slate-50 mt-1">{value}</p>
        {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
      </div>
      <div className="h-10 w-10 rounded-full bg-teal-600/20 flex items-center justify-center">
        <Icon className="h-5 w-5 text-teal-400" />
      </div>
    </div>
  );
}

function RecentMessages({ recentMessages }) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-100">Latest messages</h2>
        <Link href="/admin/messages" className="text-xs text-teal-400 hover:text-teal-300">
          View all
        </Link>
      </div>
      {recentMessages.length === 0 ? (
        <p className="text-xs text-slate-500">No messages found.</p>
      ) : (
        <ul className="divide-y divide-slate-800">
          {recentMessages.map((msg) => (
            <li key={msg._id} className="py-2">
              <p className="text-sm text-slate-100">
                {msg.name || 'Visitor'}{' '}
                {msg.createdAt && (
                  <span className="text-xs text-slate-500">
                    · {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                )}
              </p>
              {msg.message && (
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                  {msg.message}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function TomorrowAppointments({ tomorrowAppointments }) {
  return (
    <section className="border border-white/5 bg-[#0e1217] rounded-xl p-6 space-y-3">
      <h3 className="font-semibold text-white">Tomorrow&apos;s Appointments</h3>
      {tomorrowAppointments.length === 0 ? (
        <p className="text-gray-400 text-sm">No appointments scheduled for tomorrow.</p>
      ) : (
        <ul className="space-y-2 text-gray-300 text-sm">
          {tomorrowAppointments.map((appt) => (
            <li key={appt._id}>
              {formatTime(appt.date, appt.time)} — {appt.patientName || "Patient"} (
              {appt.doctorName || appt.doctor?.name || "Doctor"})
            </li>
          ))}
        </ul>
      )}
      <Link
        href="/admin/appointments"
        className="text-teal-400 text-sm hover:underline"
      >
        View full calendar →
      </Link>
    </section>
  );
}
