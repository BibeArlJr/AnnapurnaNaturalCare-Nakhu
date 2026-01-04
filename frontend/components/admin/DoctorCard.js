"use client";

import Link from "next/link";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";
import { PublishToggle, StatusPill } from "./PublishToggle";

export default function DoctorCard({ doctor, onDelete, onToggleStatus, updatingStatus }) {
  const deptName = doctor?.departmentId?.name || doctor?.department?.name || "Department";
  const experience =
    doctor?.experienceYears || doctor?.experience ? `${doctor.experienceYears || doctor.experience} yrs` : null;

  return (
    <div className="bg-[#11151c] border border-white/10 rounded-xl p-5 hover:border-teal-600/40 transition shadow-sm">
      <img
        src={doctor.photo || "/placeholder-doctor.png"}
        alt={doctor.name}
        className="w-full h-32 object-cover rounded-xl mb-3"
        loading="lazy"
      />
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-white line-clamp-1">{doctor.name}</h3>
          <p className="text-sm text-teal-300 line-clamp-1">{deptName}</p>
          {experience && <p className="text-xs text-slate-400">Experience: {experience}</p>}
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusPill status={doctor.status} />
          <PublishToggle
            status={doctor.status}
            onToggle={() => onToggleStatus?.(doctor)}
            disabled={updatingStatus}
          />
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
