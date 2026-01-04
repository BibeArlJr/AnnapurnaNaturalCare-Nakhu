import { apiGet } from '@/lib/api';
import DoctorCard from '@/components/DoctorCard';
import Container from '@/components/Container';

export const metadata = {
  title: 'Our Doctors | Annapurna Nature Cure Hospital',
};

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function DoctorsPage() {
  let doctors = [];

  try {
    const res = await apiGet('/doctors?status=published');
    doctors = res.data || [];
  } catch (err) {
    return <div className="p-6 text-red-600">Failed to load doctors</div>;
  }

  const groupedMap = doctors.reduce((acc, doc) => {
    const depName = doc.department?.name || doc.departmentName || doc.department || doc.departmentId?.name;
    if (!depName) {
      acc.__fallback.push(doc);
      return acc;
    }
    if (!acc[depName]) acc[depName] = [];
    acc[depName].push(doc);
    return acc;
  }, { __fallback: [] });

  const groupedDepartments = Object.entries(groupedMap)
    .filter(([name]) => name !== '__fallback')
    .map(([name, list]) => ({ name, doctors: list }))
    .filter(({ doctors }) => doctors.length >= 2);

  const fallbackDoctors = [
    ...groupedMap.__fallback,
    ...Object.entries(groupedMap)
      .filter(([name]) => name !== '__fallback')
      .flatMap(([_, list]) => (list.length < 2 ? list : [])),
  ];

  const renderDoctorCard = (doc) => <DoctorCard key={doc._id} doctor={doc} />;

  return (
    <div className="bg-[#f5f8f4] min-h-screen">
      <section className="bg-gradient-to-b from-white via-[#e6f2fb] to-[#f5f8f4]">
        <Container className="py-16 md:py-20 text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#10231a]">Our Doctors</h1>
          <p className="text-base md:text-lg text-[#4c5f68]">
            Experienced professionals guiding your healing journey
          </p>
        </Container>
      </section>

      <Container className="pb-16 md:pb-20 space-y-12">
        {groupedDepartments.map(({ name, doctors }) => (
          <section key={name} className="space-y-6">
            <h2 className="text-2xl font-semibold text-[#10231a]">{name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {doctors.map(renderDoctorCard)}
            </div>
          </section>
        ))}

        {fallbackDoctors.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-[#10231a]">Our Doctors</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {fallbackDoctors.map(renderDoctorCard)}
            </div>
          </section>
        )}
      </Container>
    </div>
  );
}
