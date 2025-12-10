import DoctorForm from '@/components/DoctorForm';

export default function NewDoctorPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Add Doctor</h1>
      <DoctorForm mode="create" />
    </div>
  );
}
