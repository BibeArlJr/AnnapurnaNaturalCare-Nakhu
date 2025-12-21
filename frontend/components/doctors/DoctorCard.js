"use client";

import Link from 'next/link';

export default function DoctorCard({ doctor }) {
  const image = doctor.photo || doctor.image || '/placeholder.png';
  const specialty =
    doctor.specialty ||
    doctor.specialties?.[0] ||
    doctor.department?.name ||
    'Holistic Care';

  const rawExperience =
    doctor.experienceYears ??
    doctor.experience ??
    doctor.experience_years ??
    doctor.yearsExperience;

  const experienceLabel =
    typeof rawExperience === 'number' && rawExperience > 0
      ? `${rawExperience}+ years`
      : typeof rawExperience === 'string' && rawExperience.trim()
      ? rawExperience
      : 'Experienced';

  return (
    <Link
      href={`/doctors/${doctor.slug}`}
      className="block h-full rounded-2xl border border-[#cfe8d6] bg-white shadow-sm overflow-hidden transition-shadow duration-300 hover:shadow-md"
    >
      <div className="h-52 w-full overflow-hidden bg-[#e8f3ef]">
        <img
          src={image}
          alt={doctor.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#10231a]">{doctor.name}</h3>
          <span className="inline-flex items-center rounded-full bg-[#e3f4ea] px-3 py-1 text-xs font-semibold text-[#2F8D59]">
            {experienceLabel}
          </span>
        </div>

        <p className="text-sm text-[#5a695e]">{specialty}</p>

        {doctor.department?.name && (
          <p className="text-xs text-[#2F8D59] font-medium">
            {doctor.department.name}
          </p>
        )}

        <span className="inline-flex items-center gap-1 text-sm font-medium text-primary-teal hover:underline">
          View profile →
        </span>
      </div>
    </Link>
  );
}
