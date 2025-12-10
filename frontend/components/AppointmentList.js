export default function AppointmentList({ date, appointments, loading }) {
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
                {a.time || ""} — {a.patientName || "Patient"}
              </p>
              <p className="text-gray-400 text-sm">
                Doctor: {a.doctor?.name || "Doctor"}
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
