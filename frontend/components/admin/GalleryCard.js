"use client";

import { PencilSquareIcon, TrashIcon, PhotoIcon, FilmIcon, LinkIcon } from "@heroicons/react/24/solid";
import { PublishToggle } from "./PublishToggle";

function pickPreview(item) {
  if (item.images?.length) return { type: "image", src: item.images[0] };
  if (item.videos?.length) return { type: "video", src: item.videos[0] };
  if (item.youtubeLinks?.length) return { type: "youtube", src: item.youtubeLinks[0] };
  return null;
}

export default function GalleryCard({ item, onDelete, onEdit, onToggle, toggleDisabled = false }) {
  const preview = pickPreview(item);
  const photoCount = item.images?.length || 0;
  const videoCount = item.videos?.length || 0;
  const ytCount = item.youtubeLinks?.length || 0;

  return (
    <div className="relative rounded-2xl border border-white/10 bg-[#11151c] overflow-hidden hover:border-teal-600/40 transition shadow-sm flex flex-col">
      <div className="aspect-square bg-slate-900">
        {preview?.type === "image" && (
          <img src={preview.src} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
        )}
        {preview?.type === "video" && (
          <video src={preview.src} className="h-full w-full object-cover" muted loop />
        )}
        {preview?.type === "youtube" && (
          <iframe
            src={preview.src}
            className="h-full w-full"
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
        {!preview && <div className="h-full w-full bg-slate-800" />}
      </div>

      <div className="p-3 space-y-2 flex-1">
        <p className="text-white font-semibold line-clamp-2">{item.title}</p>
        <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <PhotoIcon className="h-4 w-4 text-teal-300" /> {photoCount} photos
          </span>
          <span className="flex items-center gap-1">
            <FilmIcon className="h-4 w-4 text-teal-300" /> {videoCount} videos
          </span>
          <span className="flex items-center gap-1">
            <LinkIcon className="h-4 w-4 text-teal-300" /> {ytCount} YouTube
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <p>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}</p>
          {onToggle && (
            <PublishToggle status={item.isPublished ? "published" : "draft"} onToggle={onToggle} disabled={toggleDisabled} />
          )}
        </div>
      </div>

      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition flex items-start justify-end p-2 gap-2">
        <button
          onClick={() => onEdit?.(item)}
          className="p-2 rounded-md bg-slate-900/80 hover:bg-teal-700 transition"
          title="Edit"
        >
          <PencilSquareIcon className="h-5 w-5 text-teal-300" />
        </button>
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
