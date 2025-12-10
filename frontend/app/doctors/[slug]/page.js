import { apiGet } from '@/lib/api';
import Link from 'next/link';

export async function generateMetadata({ params }) {
  try {
    const res = await apiGet(`/doctors/${params.slug}`);
    const doc = res.data;
    return {
      title: `${doc.name} – Annapurna Hospital`,
      description: doc.bio || `Learn about Dr. ${doc.name} at Annapurna Hospital`,
    };
  } catch (error) {
    return {
      title: 'Doctor – Annapurna Hospital',
      description: 'Doctor profile at Annapurna Hospital.',
    };
  }
}

export default async function DoctorDetail({ params }) {
  const { slug } = params;

  try {
    const res = await apiGet(`/doctors/${slug}`);
    const doc = res.data;

    const specialty = doc.specialty || doc.specialties?.[0] || 'Specialist';
    const experience = doc.experience || doc.experienceYears;

    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="bg-gradient-to-r from-primary-teal to-primary-dark py-16 text-white">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-10">
            <div className="w-40 h-40 rounded-full bg-white shadow-lg overflow-hidden border-4 border-white">
              {doc.photo ? (
                <img src={doc.photo} alt={doc.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-400">No Photo</div>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold">{doc.name}</h1>
              <p className="text-lg mt-1 opacity-90">{specialty}</p>

              {doc.department?.name ? (
                <span
                  className="inline-block mt-4 px-4 py-1 text-sm rounded-full bg-white/20 border border-white/30"
                >
                  {doc.department.name}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-10">
            <section className="bg-white p-8 rounded-xl shadow-sm border border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-800 mb-4">About {doc.name}</h2>
              <p className="text-neutral-600 leading-relaxed">
                {doc.bio || 'This doctor has not added a biography yet.'}
              </p>
            </section>

            {experience ? (
              <section className="bg-white p-8 rounded-xl shadow-sm border border-neutral-200">
                <h2 className="text-xl font-semibold text-neutral-800 mb-4">Experience</h2>
                <p className="text-neutral-600">{experience} years</p>
              </section>
            ) : null}

            {doc.specialties?.length ? (
              <section className="bg-white p-8 rounded-xl shadow-sm border border-neutral-200">
                <h2 className="text-xl font-semibold text-neutral-800 mb-4">Expertise</h2>
                <p className="text-neutral-600 whitespace-pre-line">{doc.specialties.join(', ')}</p>
              </section>
            ) : null}
          </div>

          <aside className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-800 mb-3">Book an Appointment</h3>
              <p className="text-neutral-600 text-sm mb-4">Choose a date and time to book with {doc.name}.</p>
              <Link
                href={`/appointments?doctor=${doc.slug}`}
                className="block text-center bg-primary-teal hover:bg-primary-dark text-white font-semibold py-3 rounded-lg transition"
              >
                View Availability
              </Link>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-800 mb-3">Doctor Details</h3>
              <ul className="space-y-2 text-neutral-600 text-sm">
                <li>
                  <strong>Specialty:</strong> {specialty}
                </li>
                {experience ? (
                  <li>
                    <strong>Experience:</strong> {experience} years
                  </li>
                ) : null}
                {doc.department?.name ? (
                  <li>
                    <strong>Department:</strong> {doc.department.name}
                  </li>
                ) : null}
              </ul>
            </div>
          </aside>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Physician',
              name: doc.name,
              medicalSpecialty: doc.specialties || [],
            }),
          }}
        />
      </div>
    );
  } catch (err) {
    return <div className="p-6 text-red-600">Doctor not found</div>;
  }
}
