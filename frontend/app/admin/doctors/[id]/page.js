import { apiGet } from '@/lib/api';
import DoctorForm from '@/components/DoctorForm';

export default async function EditDoctorPage({ params }) {
  const { id } = params;

  let doctor = null;
  try {
    const res = await apiGet(`/doctors/${id}`);
    doctor = res.data;
  } catch (err) {
    return <div className="text-red-600">Doctor not found</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Doctor</h1>
      <DoctorForm mode="edit" initialData={doctor} />
    </div>
  );
}
