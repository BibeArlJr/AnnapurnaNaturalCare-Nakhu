import Link from 'next/link';
import { apiGet } from '@/lib/api';
import AvailableSlots from '@/components/AvailableSlots';

export const metadata = {
  title: 'Book an Appointment – Annapurna Hospital',
  description: 'Schedule appointments with doctors at Annapurna Hospital.',
};

export default async function AppointmentPage({ searchParams }) {
  const selectedSlug = searchParams?.doctor || '';

  let doctors = [];
  try {
    const res = await apiGet('/doctors');
    doctors = res.data || [];
  } catch (err) {
    return <div className="p-6 text-red-600">Failed to load doctors</div>;
  }

  const selectedDoctor = doctors.find((d) => d.slug === selectedSlug);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Book an Appointment</h1>

      <form className="space-y-2" method="get" action="/appointments">
        <label className="block font-medium" htmlFor="doctor-select">
          Select Doctor
        </label>
        <select
          id="doctor-select"
          name="doctor"
          className="border p-2 rounded w-full"
          defaultValue={selectedSlug}
        >
          <option value="">Choose...</option>
          {doctors.map((d) => (
            <option key={d._id} value={d.slug}>
              {d.name}
            </option>
          ))}
        </select>
        <div>
          <button
            type="submit"
            className="mt-2 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Continue
          </button>
        </div>
      </form>

      {!selectedDoctor && (
        <p className="text-gray-600">Select a doctor to see available slots.</p>
      )}

      {selectedDoctor && <AvailableSlots selectedDoctor={selectedDoctor} />}

      <div className="text-sm text-gray-500">
        Prefer to view doctors first? <Link href="/doctors" className="text-blue-600 hover:underline">Browse doctors</Link>
      </div>
    </div>
  );
}
