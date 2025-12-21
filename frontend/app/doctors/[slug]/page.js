import { apiGet } from '@/lib/api';
import Link from 'next/link';
import DoctorCard from '@/components/DoctorCard';

export const revalidate = 0;

export async function generateMetadata({ params }) {
  try {
    const res = await apiGet(`/doctors/${params.slug}`);
    const doc = res.data;
    return {
      title: `${doc.name} – Annapurna Hospital`,
      description: doc.bio || doc.description || `Learn about Dr. ${doc.name} at Annapurna Hospital`,
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

    let related = [];
    try {
      const allDocsRes = await apiGet('/doctors');
      const allDocs = allDocsRes?.data || [];
      const sameDept = allDocs.filter(
        (d) => d._id !== doc._id && (d.departmentId?._id || d.departmentId) === (doc.departmentId?._id || doc.departmentId)
      );
      const fallback = allDocs.filter((d) => d._id !== doc._id);
      related = (sameDept.length ? sameDept : fallback).slice(0, 3);
    } catch (_) {
      related = [];
    }

    const specialty = doc.specialty || doc.specialties?.[0] || 'Specialist';
    const qualifications = Array.isArray(doc.medicalQualifications) ? doc.medicalQualifications.filter((q) => q && q.degree) : [];

    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="bg-gradient-to-r from-primary-teal to-primary-dark py-14 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-3">
                <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-white shadow-lg overflow-hidden border-4 border-white">
                  {doc.photo ? (
                    <img src={doc.photo} alt={doc.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400">No Photo</div>
                  )}
                </div>
                <div className="space-y-1">
                  <h1 className="text-3xl md:text-4xl font-semibold">{doc.name}</h1>
                  <p className="text-sm md:text-base opacity-90">{specialty}</p>
                  {doc.department?.name ? (
                    <span className="inline-block mt-2 px-4 py-1 text-sm rounded-full bg-white/15 border border-white/25">
                      {doc.department.name}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/90 text-neutral-900 rounded-xl border border-white/70 shadow-md p-5 h-full">
                  <h3 className="text-lg font-semibold text-neutral-800 mb-3">Doctor Details</h3>
                  <ul className="space-y-2 text-neutral-700 text-sm">
                    <li>
                      <strong>Specialty:</strong> {specialty}
                    </li>
                    {doc.degree ? (
                      <li>
                        <strong>Degree:</strong> {doc.degree}
                      </li>
                    ) : null}
                    {doc.experienceYears ? (
                      <li>
                        <strong>Experience:</strong> {doc.experienceYears} years
                      </li>
                    ) : null}
                    {doc.department?.name ? (
                      <li>
                        <strong>Department:</strong> {doc.department.name}
                      </li>
                    ) : null}
                  </ul>
                </div>
                <div className="bg-white/90 text-neutral-900 rounded-xl border border-white/70 shadow-md p-5 h-full">
                  <h3 className="text-lg font-semibold text-neutral-800 mb-3">Book an Appointment</h3>
                  <p className="text-neutral-700 text-sm mb-4">Choose a date and time to book with {doc.name}.</p>
                  <div className="flex justify-center">
                    <Link
                      href={`/appointments?doctor=${doc.slug}`}
                      className="inline-block text-center bg-primary-teal hover:bg-primary-dark text-white font-semibold px-4 py-2 rounded-lg transition"
                    >
                      View Availability
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-8">
            <section className="bg-white p-8 rounded-xl shadow-sm border border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-800 mb-4">About {doc.name}</h2>
              {doc.description ? (
                <div
                  className="prose prose-green max-w-none text-neutral-700"
                  dangerouslySetInnerHTML={{ __html: doc.description }}
                />
              ) : (
                <p className="text-neutral-600 leading-relaxed">
                  {doc.bio || 'This doctor has not added a biography yet.'}
                </p>
              )}
              {qualifications.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h3 className="text-lg font-semibold text-neutral-800">Medical Qualifications</h3>
                  <ul className="space-y-2 text-neutral-700 text-sm">
                    {qualifications.map((q, idx) => (
                      <li key={idx} className="leading-tight">
                        <span className="font-semibold">{q.degree}</span>
                        {(q.institution || q.year) && (
                          <span className="text-neutral-600">
                            {' '}
                            — {q.institution || ''}{q.institution && q.year ? ', ' : ''}{q.year || ''}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            <aside className="lg:pl-4 lg:border-l lg:border-emerald-100 space-y-4 lg:sticky lg:top-24 h-fit">
              <h3 className="text-lg font-semibold text-neutral-800">Other doctors you can consult</h3>
              <div className="space-y-4">
                {related.slice(0, 3).map((other) => (
                  <DoctorCard key={other._id} doctor={other} variant="compact" />
                ))}
              </div>
            </aside>
          </div>
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
