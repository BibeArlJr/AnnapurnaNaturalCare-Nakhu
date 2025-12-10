import DepartmentForm from '@/components/DepartmentForm';

export default function NewDepartmentPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Add Department</h1>
      <DepartmentForm mode="create" />
    </div>
  );
}
