import Link from 'next/link';

export default function DepartmentCard({ department }) {
  return (
    <Link
      href={`/departments/${department.slug}`}
      className="
        group block h-full rounded-3xl border border-[#cfe8d6] bg-white shadow-sm
        overflow-hidden transition-all duration-300 hover:shadow-md
      "
    >
      <img
        src={department.image || department.heroImage || '/placeholder.png'}
        alt={department.name}
        className="w-full h-44 object-cover rounded-t-3xl"
        loading="lazy"
      />

      <div className="p-5 flex flex-col h-full">
        <h3 className="text-xl font-semibold text-[#10231a] group-hover:text-primary-teal transition-colors duration-200">
          {department.name}
        </h3>

        {department.description && (
          <p className="mt-2 text-sm text-[#5a695e] leading-relaxed line-clamp-3">
            {department.description}
          </p>
        )}

        <span className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-primary-teal group-hover:underline">
          View Department →
        </span>
      </div>
    </Link>
  );
}
