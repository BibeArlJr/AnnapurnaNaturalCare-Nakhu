import { apiGet } from '@/lib/api';
import Link from 'next/link';
import DoctorCard from '@/components/DoctorCard';

export async function generateMetadata({ params }) {
  try {
    const res = await apiGet(`/departments/${params.slug}`);
    const dep = res.data;
    return {
      title: `${dep.name} – Annapurna Hospital`,
      description: dep.description,
    };
  } catch (error) {
    return {
      title: 'Department – Annapurna Hospital',
      description: 'Department details at Annapurna Hospital.',
    };
  }
}

export default async function DepartmentDetail({ params }) {
  const departmentRes = await apiGet(`/departments/${params.slug}`);
  const department = departmentRes.data;

  let doctors = [];
  try {
    const docRes = await apiGet(`/doctors?department=${department.slug}`);
    doctors = docRes.data || [];
  } catch (error) {
    doctors = [];
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-gradient-to-r from-primary-teal to-primary-dark py-16 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl font-bold tracking-tight">{department.name}</h1>
          {department.description ? (
            <p className="mt-4 text-lg max-w-3xl opacity-90">{department.description}</p>
          ) : null}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200">
          <h2 className="text-2xl font-semibold text-neutral-800 mb-4">About the Department</h2>
          <p className="text-neutral-600 leading-relaxed">
            {department.description || 'No description provided yet.'}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-neutral-800 mb-6">Doctors in {department.name}</h2>

          {doctors.length === 0 && <p className="text-neutral-500">No doctors have been added to this department yet.</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {doctors.map((doc) => (
              <DoctorCard key={doc._id} doctor={doc} />
            ))}
          </div>

          {doctors.length > 0 && (
            <div className="mt-10">
              <Link
                href={`/appointments?department=${department.slug}`}
                className="inline-block bg-primary-teal hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                Book an Appointment
              </Link>
            </div>
          )}
        </section>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MedicalDepartment',
            name: department.name,
            description: department.description,
          }),
        }}
      />
    </div>
  );
}
