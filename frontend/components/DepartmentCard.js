import Link from 'next/link';

export default function DepartmentCard({ department }) {
  return (
    <Link
      href={`/departments/${department.slug}`}
      className="
        bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200
        border border-neutral-200 overflow-hidden group
      "
    >
      <div className="h-40 w-full bg-neutral-100 flex items-center justify-center">
        <span className="text-neutral-400 text-xl font-semibold group-hover:text-primary-teal transition">
          {department.name}
        </span>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-neutral-800 group-hover:text-primary-teal transition">
          {department.name}
        </h3>

        {department.description && (
          <p className="mt-1 text-sm text-neutral-500 line-clamp-2">
            {department.description}
          </p>
        )}

        <span className="inline-block mt-3 text-primary-teal font-medium text-sm hover:underline">
          View Department →
        </span>
      </div>
    </Link>
  );
}
