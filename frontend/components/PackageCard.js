export default function PackageCard({ pkg }) {
  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-md transition">
      {pkg.images?.length ? (
        <img
          src={pkg.images[0]}
          alt={pkg.title}
          className="w-full h-48 object-cover rounded mb-3"
        />
      ) : null}

      <h2 className="text-xl font-semibold mb-1">{pkg.title}</h2>

      {pkg.description ? (
        <p className="text-gray-700 text-sm mb-2 line-clamp-3">{pkg.description}</p>
      ) : null}

      <p className="font-semibold text-blue-700 mb-2">NPR {pkg.price}</p>

      <a href={`/pack/${pkg.slug}`} className="text-blue-600 hover:underline">
        View Details →
      </a>
    </div>
  );
}
