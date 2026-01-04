import { apiGet } from "@/lib/api";
import Link from "next/link";
import DoctorCard from "@/components/DoctorCard";
import Container from "@/components/Container";
import DepartmentMediaCarousel from "@/components/DepartmentMediaCarousel";
import DepartmentVideoCarousel from "@/components/DepartmentVideoCarousel";

export const revalidate = 0;
export const dynamic = "force-dynamic";

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
  const mediaImages = Array.from(
    new Set(
      [
        department.coverImage,
        department.heroImage,
        department.image,
        ...(department.images || []),
      ]
        .map((img) => (typeof img === "string" ? img : img?.url))
        .filter(Boolean)
    )
  );
  const videos = department.videos || [];

  let doctors = [];
  try {
    const docRes = await apiGet(`/doctors?department=${department.slug}&status=published`);
    doctors = docRes.data || [];
  } catch (error) {
    doctors = [];
  }

  return (
    <div className="min-h-screen bg-[#f5f8f4]">
      <Container className="py-12 md:py-16 space-y-12">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="w-full">
            <DepartmentMediaCarousel
              images={mediaImages.length ? mediaImages : ["/placeholder.png"]}
            />
          </div>
          <div className="space-y-3 self-center">
            <p className="text-xs uppercase tracking-wider text-[#2F8D59]">About the Department</p>
            <h1 className="text-3xl md:text-4xl font-semibold text-[#10231a]">{department.name}</h1>
            {department.shortTagline || department.tagline ? (
              <div className="mt-2 pl-3 border-l-2 border-[#cfe8d6]">
                <p className="text-sm text-slate-500 leading-relaxed">
                  {department.shortTagline || department.tagline}
                </p>
              </div>
            ) : null}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-[#cfe8d6] shadow-sm p-6 md:p-8 space-y-3">
          <h2 className="text-2xl font-semibold text-[#10231a]">Description</h2>
          <div
            className="prose prose-green max-w-none"
            dangerouslySetInnerHTML={{ __html: department.description || '' }}
          />
        </section>

        {videos.length > 0 && (
          <section className="bg-white rounded-2xl border border-[#cfe8d6] shadow-sm p-6 md:p-8 space-y-3">
            <h2 className="text-2xl font-semibold text-[#10231a]">Department Videos</h2>
            <p className="text-sm text-[#4c5f68]">Highlights and walkthroughs from our team.</p>
            <DepartmentVideoCarousel videos={videos} />
          </section>
        )}

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-[#10231a]">Doctors in {department.name}</h2>
            <div className="mt-2 h-px bg-[#dfe8e2]" />
          </div>

          {doctors.length === 0 && (
            <p className="text-sm text-[#5a695e]">No doctors have been added to this department yet.</p>
          )}

          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 ${
              doctors.length === 1 ? 'justify-items-center' : ''
            }`}
          >
            {doctors.map((doc) => (
              <DoctorCard key={doc._id} doctor={doc} />
            ))}
          </div>
        </section>
      </Container>

      <section className="bg-gradient-to-r from-[#e3f2ea] via-[#d6ecf2] to-[#e3f2ea]">
        <Container className="py-14 md:py-16 text-center space-y-4">
          <h3 className="text-2xl font-semibold text-[#10231a]">
            Consult our specialists in this department
          </h3>
          <p className="text-sm md:text-base text-[#4c5f68] max-w-3xl mx-auto">
            Book an appointment to discuss personalized care plans and start your healing journey.
          </p>
          <Link
            href={`/appointments?department=${department.slug}`}
            className="inline-flex items-center justify-center rounded-full bg-[#2F8D59] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[#27784c]"
          >
            Book an Appointment
          </Link>
        </Container>
      </section>

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
