"use client";

import Link from "next/link";

export default function HealthProgramCard({ program }) {
  if (!program) return null;
  const modes = program.modesAvailable || [];
  return (
    <Link
      href={`/health-programs/${program.slug || program._id}`}
      className="group rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-xl transition overflow-hidden flex flex-col"
    >
      <div className="h-52 bg-slate-100 overflow-hidden">
        {program.coverImage ? (
          <img
            src={program.coverImage}
            alt={program.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">No image</div>
        )}
      </div>
      <div className="p-5 space-y-3 flex-1 flex flex-col">
        <div className="flex gap-2 text-xs uppercase tracking-wide text-teal-600 flex-wrap">
          {modes.slice(0, 3).map((m) => (
            <span key={m} className="px-2 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-700">
              {m}
            </span>
          ))}
        </div>
        <h3 className="text-xl font-semibold text-slate-900 group-hover:text-teal-700 transition line-clamp-2">
          {program.title}
        </h3>
        <p className="text-slate-600 text-sm line-clamp-3">{program.shortDescription}</p>
        <div className="flex items-center justify-between text-sm text-slate-700 pt-2 mt-auto">
          <span>{program.durationInDays ? `${program.durationInDays} days` : "Flexible duration"}</span>
          <span className="font-semibold text-teal-700">From ${program.pricing?.online || 0}</span>
        </div>
      </div>
    </Link>
  );
}
