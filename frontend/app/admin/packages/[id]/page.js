import { apiGet } from '@/lib/api';
import PackageForm from '@/components/PackageForm';

export default async function EditPackagePage({ params }) {
  const { id } = params;

  let pkg = null;
  try {
    const res = await apiGet(`/packages/${id}`);
    pkg = res.data;
  } catch (err) {
    return <div className="text-red-600">Package not found</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Package</h1>
      <PackageForm mode="edit" initialData={pkg} />
    </div>
  );
}
