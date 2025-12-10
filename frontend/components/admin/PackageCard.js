"use client";

import { PencilSquareIcon, TrashIcon, TagIcon } from "@heroicons/react/24/solid";

export default function PackageCard({ pkg, onEdit, onDelete }) {
  return (
    <div className="bg-[#11151c] border border-white/10 rounded-xl p-4 hover:border-teal-600/40 transition shadow-sm">
      <div className="flex gap-3 mb-3">
        <div className="h-16 w-20 rounded-lg overflow-hidden border border-slate-800 bg-slate-900 flex items-center justify-center">
          {pkg?.imageUrl ? (
            <img src={pkg.imageUrl} alt={pkg.name} className="h-full w-full object-cover" />
          ) : (
            <TagIcon className="h-8 w-8 text-slate-600" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-white line-clamp-1">{pkg.name}</h3>
          </div>
          <p className="text-sm text-teal-300 font-semibold">
            {pkg.price ? `$${pkg.price}` : "Price N/A"} {pkg.duration && `· ${pkg.duration}`}
          </p>
        </div>
      </div>

      <p className="text-sm text-gray-400 line-clamp-3 mb-4">{pkg.shortDescription || "No description."}</p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 line-clamp-1">
          {pkg.departmentId?.name ? `Dept: ${pkg.departmentId.name}` : "No department"}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit?.(pkg)}
            className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 transition"
            title="Edit"
          >
            <PencilSquareIcon className="h-5 w-5 text-teal-300" />
          </button>
          <button
            onClick={() => onDelete?.(pkg._id)}
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
