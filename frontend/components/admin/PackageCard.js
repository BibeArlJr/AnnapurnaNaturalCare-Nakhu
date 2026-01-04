"use client";

import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";
import { PublishToggle, StatusPill } from "./PublishToggle";

export default function PackageCard({ pkg, onEdit, onDelete, onToggleStatus, updatingStatus }) {
  return (
    <div className="bg-[#11151c] border border-white/10 rounded-xl p-4 hover:border-teal-600/40 transition shadow-sm">
      <img
        src={pkg.imageUrl || "/placeholder-package.png"}
        alt={pkg.name}
        className="w-full h-32 object-cover rounded-xl mb-3"
        loading="lazy"
      />
      <div className="min-w-0 mb-2 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-white line-clamp-1">{pkg.name}</h3>
          </div>
          <p className="text-sm text-teal-300 font-semibold">
            {pkg.price ? `$${pkg.price}` : "Price N/A"} {pkg.duration && `· ${pkg.duration}`}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusPill status={pkg.status} />
          <PublishToggle
            status={pkg.status}
            onToggle={() => onToggleStatus?.(pkg)}
            disabled={updatingStatus}
          />
        </div>
      </div>

      <p className="text-sm text-gray-400 line-clamp-3 mb-4">{pkg.shortDescription || "No description."}</p>

      {Array.isArray(pkg.departments) && pkg.departments.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {pkg.departments.map((dep) => (
            <span key={dep._id || dep} className="px-2 py-1 bg-slate-800 text-xs rounded text-slate-200 border border-slate-700">
              {dep.name || dep}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
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
