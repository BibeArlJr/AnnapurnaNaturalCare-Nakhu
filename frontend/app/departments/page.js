import DepartmentsGrid from '@/components/DepartmentsGrid';
import { apiGet } from '@/lib/api';
import Container from '@/components/Container';

export const metadata = {
  title: 'Departments – Annapurna Hospital',
  description: 'Browse medical departments and specialties at Annapurna Hospital.',
};

export const revalidate = 0;

export default async function DepartmentsPage() {
  let departments = [];

  try {
    const res = await apiGet('/departments');
    departments = res.data || [];
  } catch (err) {
    return <div className="p-6 text-red-600">Failed to load departments</div>;
  }

  return (
    <div className="min-h-screen bg-[#f5f8f4]">
      <Container className="py-16 md:py-20 space-y-8">
        <header className="max-w-3xl mx-auto text-left md:text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#10231a]">
            Our Departments
          </h1>
          <p className="text-base md:text-lg text-[#5a695e]">
            Specialized care units designed for holistic healing
          </p>
        </header>

        <DepartmentsGrid departments={departments} />
      </Container>
    </div>
  );
}
