import Link from 'next/link';

function Highlight({ text, term }) {
  if (!term) return text;
  const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")})`, "i");
  const parts = (text || "").split(regex);
  return parts.map((part, idx) =>
    regex.test(part) ? (
      <mark key={idx} className="bg-yellow-100 text-inherit">
        {part}
      </mark>
    ) : (
      <span key={idx}>{part}</span>
    )
  );
}

export default function DepartmentCard({ department, highlightTerm }) {
  const rawDesc = department.shortDescription || department.tagline || department.description;
  const plainDesc = rawDesc ? rawDesc.replace(/<[^>]*>/g, '') : '';

  return (
    <Link
      href={`/departments/${department.slug}`}
      className="
        group block h-full min-h-[240px] rounded-3xl border border-[#cfe8d6] bg-white shadow-sm
        overflow-hidden transition-all duration-300 hover:shadow-md
        flex flex-col justify-between
      "
    >
      <div className="h-40 overflow-hidden rounded-t-3xl flex-shrink-0">
        <img
          src={department.image || department.heroImage || '/placeholder.png'}
          alt={department.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="p-5 flex flex-col justify-between flex-1">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-[#10231a] group-hover:text-primary-teal transition-colors duration-200 line-clamp-2 leading-tight overflow-hidden text-ellipsis">
            <Highlight text={department.name} term={highlightTerm} />
          </h3>

        {plainDesc && (
          <p className="mt-2 text-sm text-[#5a695e] leading-relaxed line-clamp-3">
            <Highlight text={plainDesc} term={highlightTerm} />
          </p>
        )}
        </div>

        <span className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-primary-teal group-hover:underline">
          View Department →
        </span>
      </div>
    </Link>
  );
}
