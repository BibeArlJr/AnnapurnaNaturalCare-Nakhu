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

function doctorLabel(a) {
  return a.doctor?.name || a.doctor || a.doctorName || "No doctor assigned";
}

export default function AppointmentList({ date, appointments, loading, openAppointmentDetails }) {
  return (
    <div className="border border-white/5 bg-[#0e1217] rounded-xl p-6 space-y-4">
      <h3 className="font-semibold text-white text-lg">Appointments on {date}</h3>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : appointments.length === 0 ? (
        <p className="text-gray-400">No appointments found for this day.</p>
      ) : (
        <ul className="space-y-3">
          {appointments.map((a) => (
            <li
              key={a._id}
              className="p-3 rounded-lg bg-[#161b22] border border-white/5"
            >
              <p className="text-white font-medium">
                {formatTime(a.time || "")} • Dr.{" "}
                <span
                  className="hover:text-teal-400 cursor-pointer transition"
                  onClick={() => openAppointmentDetails?.(a)}
                >
                  {doctorLabel(a)}
                </span>
                {statusBadge(a.status)}
              </p>
              <p className="text-gray-400 text-sm">
                Patient: {a.patientName || a.name || "Patient"}
              </p>
              <p className="text-gray-600 text-sm">
                Email: {a.patientEmail || "-"} | Phone: {a.patientPhone || "-"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
