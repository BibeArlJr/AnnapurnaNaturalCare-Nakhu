import Link from 'next/link';

export default function DoctorCard({ doctor, variant }) {
  const isCompact = variant === 'compact';
  const wrapperPadding = isCompact ? 'p-4' : 'p-5';
  const imageSize = isCompact ? 'w-28 h-28' : 'w-36 h-36';
  const ctaMargin = isCompact ? 'mt-3' : 'mt-4';

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
        {doctor.name}
      </h3>

      {(doctor.specialty || doctor.specialties?.[0]) ? (
        <p className="text-sm text-[#5a695e] mt-1">
          {doctor.specialty || doctor.specialties?.[0]}
        </p>
      ) : null}

      {doctor.department?.name ? (
        <span
          className="
          mt-3 inline-block text-xs px-3 py-1 rounded-full bg-primary-light/10
          text-primary-teal font-medium
        "
        >
          {doctor.department.name}
        </span>
      ) : null}

      <span className={`inline-block ${ctaMargin} text-primary-teal font-medium text-sm hover:underline`}>
        View Profile →
      </span>
    </Link>
  );
}
