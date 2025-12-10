import DoctorCard from '@/components/DoctorCard';
import { apiGet } from '@/lib/api';

export const metadata = {
  title: 'Our Doctors | Annapurna Nature Cure Hospital',
};

export default async function DoctorsPage() {
  let doctors = [];

  try {
    const res = await apiGet('/doctors');
    doctors = res.data || [];
  } catch (err) {
    return <div className="p-6 text-red-600">Failed to load doctors</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-neutral-800 mb-6">Our Doctors</h1>

      <div
        className="
          grid gap-6
          grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
        "
      >
        {doctors.map((doc) => (
          <DoctorCard key={doc._id} doctor={doc} />
        ))}
      </div>
    </div>
  );
}
