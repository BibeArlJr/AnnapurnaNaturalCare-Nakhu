import Link from 'next/link';

export default function DoctorCard({ doctor }) {
  return (
    <Link
      href={`/doctors/${doctor.slug}`}
      className="
        bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200
        border border-neutral-200 p-6 flex flex-col items-center text-center
      "
    >
      <div className="w-28 h-28 rounded-full bg-neutral-100 overflow-hidden mb-4 shadow-sm">
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

      <h3 className="text-lg font-semibold text-neutral-800 group-hover:text-primary-teal transition">
        {doctor.name}
      </h3>

      <p className="text-sm text-neutral-500 mt-1">
        {doctor.specialty || doctor.specialties?.[0] || ''}
      </p>

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

      <span className="inline-block mt-4 text-primary-teal font-medium text-sm hover:underline">
        View Profile →
      </span>
    </Link>
  );
}
