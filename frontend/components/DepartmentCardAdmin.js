import Link from "next/link";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";

export default function DepartmentCardAdmin({ dept, onDelete }) {
  return (
    <div className="bg-[#11151c] border border-white/10 rounded-xl p-5 hover:border-teal-600/40 transition shadow-sm">
      <img
        src={dept.image || dept.heroImage || "/placeholder.png"}
        alt={dept.name}
        className="w-full h-32 object-cover rounded-xl mb-3"
        loading="lazy"
      />
      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">{dept.name}</h3>

      <p className="text-gray-400 text-sm line-clamp-3 mb-4">
        {dept.description || "No description provided."}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Doctors: {dept?.doctorCount || 0}
        </span>

        <div className="flex items-center gap-3">
          <Link
            href={`/admin/departments/${dept._id}`}
            className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 transition"
            title="Edit"
          >
            <PencilSquareIcon className="h-5 w-5 text-teal-300" />
          </Link>

          <button
            onClick={() => onDelete(dept._id)}
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
