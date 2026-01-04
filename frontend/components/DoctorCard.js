import Link from 'next/link';

function Highlight({ text, term }) {
  if (!term) return text;
  const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")})`, "i");
  const parts = text.split(regex);
  return parts.map((part, idx) =>
    regex.test(part) ? (
      <mark key={idx} className="bg-yellow-100 text-inherit">{part}</mark>
    ) : (
      <span key={idx}>{part}</span>
    )
  );
}

export default function DoctorCard({ doctor, variant, highlightTerm }) {
  const isCompact = variant === 'compact';
  const wrapperPadding = isCompact ? 'p-4' : 'p-5';
  const imageSize = isCompact ? 'w-28 h-28' : 'w-36 h-36';
  const ctaMargin = isCompact ? 'mt-3' : 'mt-4';
  const departmentName =
    doctor.department?.name || doctor.department?.title || doctor.departmentName;
  const qualification = doctor.degree || doctor.qualification || doctor.qualifications?.[0];

  return (
    <Link
      href={`/doctors/${doctor.slug}`}
      className={`
        bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200
        border border-neutral-200 flex flex-col items-center text-center ${wrapperPadding}
      `}
    >
      <div className={`${imageSize} rounded-full bg-neutral-100 overflow-hidden mb-4 shadow-sm`}>
        {doctor.photo || doctor.image ? (
          <img
            src={doctor.photo || doctor.image}
            alt={doctor.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400">
            No Image
          </div>
        )}
      </div>

      <h3 className="text-base font-semibold text-[#10231a] group-hover:text-primary-teal transition">
        <Highlight text={doctor.name} term={highlightTerm} />
      </h3>

      {(departmentName || qualification) && (
        <div className="flex flex-col items-center gap-1 mt-2">
          {departmentName && (
            <p className="text-sm font-semibold text-[#2F8D59]">
              <Highlight text={departmentName} term={highlightTerm} />
            </p>
          )}
          {qualification && <p className="text-xs text-[#4c5f68]"><Highlight text={qualification} term={highlightTerm} /></p>}
        </div>
      )}

      <span className={`inline-block ${ctaMargin} text-primary-teal font-medium text-sm hover:underline`}>
        View Profile →
      </span>
    </Link>
  );
}
