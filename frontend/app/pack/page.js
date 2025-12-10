import { apiGet } from '@/lib/api';
import PackageCard from '@/components/PackageCard';

export const metadata = {
  title: 'Health Packages – Annapurna Hospital',
  description: 'Explore health packages and wellness programs at Annapurna Hospital.',
};

export default async function PackageListPage() {
  let packages = [];

  try {
    const res = await apiGet('/packages');
    packages = res.data || [];
  } catch (err) {
    return <div className="p-6 text-red-600">Failed to load packages</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Health Packages</h1>

      <div className="grid grid-cols-1 sm-grid-cols-2 md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <PackageCard key={pkg._id} pkg={pkg} />
        ))}
      </div>
    </div>
  );
}
