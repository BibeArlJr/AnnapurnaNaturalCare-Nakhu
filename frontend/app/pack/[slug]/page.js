import { apiGet } from '@/lib/api';

export async function generateMetadata({ params }) {
  try {
    const res = await apiGet(`/packages/${params.slug}`);
    const pkg = res.data;
    return {
      title: `${pkg.title} – Annapurna Hospital`,
      description: pkg.description,
    };
  } catch (error) {
    return {
      title: 'Package – Annapurna Hospital',
      description: 'Health package details at Annapurna Hospital.',
    };
  }
}

export default async function PackageDetailPage({ params }) {
  const { slug } = params;

  try {
    const res = await apiGet(`/packages/${slug}`);
    const pkg = res.data;

    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {pkg.images?.length ? (
          <img
            src={pkg.images[0]}
            alt={pkg.title}
            className="w-full h-64 object-cover rounded"
          />
        ) : null}

        <h1 className="text-3xl font-bold">{pkg.title}</h1>

        <p className="text-gray-800 whitespace-pre-line">{pkg.description}</p>

        <p className="text-2xl text-blue-700 font-semibold">NPR {pkg.price}</p>
      </div>
    );
  } catch (err) {
    return <div className="p-6 text-red-600">Package not found</div>;
  }
}
