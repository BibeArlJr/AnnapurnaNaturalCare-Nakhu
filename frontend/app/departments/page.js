import DepartmentCard from '@/components/DepartmentCard';
import { apiGet } from '@/lib/api';

export const metadata = {
  title: 'Departments – Annapurna Hospital',
  description: 'Browse medical departments and specialties at Annapurna Hospital.',
};

export default async function DepartmentsPage() {
  let departments = [];

  try {
    const res = await apiGet('/departments');
    departments = res.data || [];
  } catch (err) {
    return <div className="p-6 text-red-600">Failed to load departments</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-neutral-800 mb-6">Our Departments</h1>

      <div
        className="
    grid gap-6
    grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
  "
      >
        {departments.map((dep) => (
          <DepartmentCard key={dep._id} department={dep} />
        ))}
      </div>
    </div>
  );
}
