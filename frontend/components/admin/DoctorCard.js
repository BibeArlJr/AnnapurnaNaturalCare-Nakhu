"use client";

import Link from "next/link";
import { PencilSquareIcon, TrashIcon, UserGroupIcon } from "@heroicons/react/24/solid";

export default function DoctorCard({ doctor, onDelete }) {
  const deptName = doctor?.departmentId?.name || doctor?.department?.name || "Department";
  const experience =
    doctor?.experienceYears || doctor?.experience ? `${doctor.experienceYears || doctor.experience} yrs` : null;

  return (
    <div className="bg-[#11151c] border border-white/10 rounded-xl p-5 hover:border-teal-600/40 transition shadow-sm">
      <div className="flex items-center gap-4 mb-3">
        <div className="h-14 w-14 rounded-full overflow-hidden border border-slate-800 bg-slate-900">
          {doctor?.photo ? (
            <img src={doctor.photo} alt={doctor.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-slate-500">
              <UserGroupIcon className="h-7 w-7" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-white line-clamp-1">{doctor.name}</h3>
          <p className="text-sm text-teal-300 line-clamp-1">{deptName}</p>
          {experience && <p className="text-xs text-slate-400">Experience: {experience}</p>}
        </div>
      </div>

      <p className="text-gray-400 text-sm line-clamp-3 mb-4">
        {doctor.bio || "No bio provided."}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{doctor.email || doctor.phone ? [doctor.email, doctor.phone].filter(Boolean).join(" · ") : "Contact not set"}</span>
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/doctors/${doctor._id}`}
            className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 transition"
            title="Edit"
          >
            <PencilSquareIcon className="h-5 w-5 text-teal-300" />
          </Link>
          <button
            onClick={() => onDelete?.(doctor._id)}
            className="p-2 rounded-md bg-slate-800 hover:bg-rose-700 transition"
            title="Delete"
          >
            <TrashIcon className="h-5 w-5 text-rose-300" />
          </button>
        </div>
      </div>
    </div>
  );
}
