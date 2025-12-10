"use client";

import { PhotoIcon, TrashIcon } from "@heroicons/react/24/solid";

export default function GalleryCard({ item, onDelete }) {
  return (
    <div className="relative rounded-xl border border-white/10 bg-[#11151c] overflow-hidden group hover:border-teal-600/40 transition shadow-sm">
      <div className="aspect-square bg-slate-900">
        {item?.url ? (
          <img src={item.url} alt={item.caption || "Gallery"} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-slate-500">
            <PhotoIcon className="h-10 w-10" />
          </div>
        )}
      </div>
      {item?.caption && (
        <p className="px-3 py-2 text-sm text-slate-200">{item.caption}</p>
      )}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-start justify-end p-2">
        <button
          onClick={() => onDelete?.(item._id)}
          className="p-2 rounded-md bg-slate-900/80 hover:bg-rose-700 transition"
          title="Delete"
        >
          <TrashIcon className="h-5 w-5 text-rose-300" />
        </button>
      </div>
    </div>
  );
}
