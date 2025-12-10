import AppointmentForm from '@/components/AppointmentForm';
import { apiGet } from '@/lib/api';

export default async function BookingFormPage({ searchParams }) {
  const { doctor, date, time } = searchParams || {};

  if (!doctor || !date || !time) {
    return <div className="p-6 text-red-600">Missing booking info</div>;
  }

  let doc = null;
  try {
    const res = await apiGet(`/doctors/${doctor}`);
    doc = res.data;
  } catch (err) {
    return <div className="p-6 text-red-600">Invalid doctor</div>;
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Confirm Appointment</h1>

      <p>
        <strong>Doctor:</strong> {doc.name}
      </p>
      <p>
        <strong>Date:</strong> {date}
      </p>
      <p>
        <strong>Time:</strong> {time}
      </p>

      <AppointmentForm doctorId={doc._id} date={date} time={time} />
    </div>
  );
}
