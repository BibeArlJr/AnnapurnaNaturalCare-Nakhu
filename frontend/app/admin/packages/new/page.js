import PackageForm from '@/components/PackageForm';

export default function NewPackagePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Add Package</h1>
      <PackageForm mode="create" />
    </div>
  );
}
