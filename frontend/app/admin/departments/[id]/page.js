import { apiGet } from '@/lib/api';
import DepartmentForm from '@/components/DepartmentForm';

export default async function EditDepartmentPage({ params }) {
  const { id } = params;

  let department = null;
  try {
    const res = await apiGet(`/departments/${id}`);
    department = res.data;
  } catch (err) {
    return <div className="text-red-600">Department not found</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Department</h1>
      <DepartmentForm mode="edit" initialData={department} />
    </div>
  );
}
