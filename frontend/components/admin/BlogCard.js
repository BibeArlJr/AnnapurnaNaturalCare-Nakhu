"use client";

import Link from "next/link";
import { PencilSquareIcon, TrashIcon, PlayIcon } from "@heroicons/react/24/solid";
import { PublishToggle, StatusPill } from "./PublishToggle";

function extractYouTubeID(url) {
  try {
    const u = new URL(url);
    if (u.searchParams.get("v")) return u.searchParams.get("v");

    // Handle youtu.be short links
    const path = u.pathname.split("/");
    return path[path.length - 1];
  } catch {
    return "";
  }
}

export default function BlogCard({ post, onDelete, onToggleStatus, updatingStatus }) {
  const { _id, title, categoryId, createdAt, images = [], videos = [], youtubeLinks = [], mediaUrl } = post;

  function renderPreview() {
    const primaryImage = images[0];
    const primaryVideo = videos[0];
    const primaryYoutube = youtubeLinks[0];
    const legacyMedia = mediaUrl;

    if (primaryImage || legacyMedia) {
      return (
        <img
          src={primaryImage || legacyMedia}
          className="h-36 w-full object-cover rounded-xl border border-slate-800"
          alt="preview"
        />
      );
    }

    if (primaryVideo) {
      return (
        <video
          src={primaryVideo}
          className="h-36 w-full object-cover rounded-xl border border-slate-800"
        />
      );
    }

    if (primaryYoutube) {
      const id = extractYouTubeID(primaryYoutube);
      const src = id ? `https://www.youtube.com/embed/${id}` : primaryYoutube;
      return (
        <div className="relative h-36 w-full rounded-xl overflow-hidden border border-slate-800">
          <iframe
            className="absolute inset-0 w-full h-full"
            src={src}
            allowFullScreen
          />
        </div>
      );
    }

    return <div className="h-36 bg-slate-800 rounded-xl" />;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#11151c] p-3 space-y-3 hover:border-teal-600/40 transition">
      <Link href={`/admin/blogs/${_id}`}>
        <div className="cursor-pointer">{renderPreview()}</div>
      </Link>

      <div className="space-y-1">
        <Link href={`/admin/blogs/${_id}`}>
          <p className="text-white font-semibold hover:text-teal-400 transition line-clamp-2">
            {title}
          </p>
        </Link>
        <p className="text-xs text-slate-400">
          {categoryId?.name || "Uncategorized"}
        </p>
        <p className="text-[11px] text-slate-500">
          {createdAt ? new Date(createdAt).toLocaleDateString() : ""}
        </p>
      </div>

      <div className="flex justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <StatusPill status={post.status} />
          <PublishToggle
            status={post.status}
            onToggle={() => onToggleStatus?.(post)}
            disabled={updatingStatus}
          />
        </div>
        <Link
          href={`/admin/blogs/${_id}`}
          className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 transition"
        >
          <PencilSquareIcon className="h-4 w-4 text-teal-300" />
        </Link>

        <button
          onClick={() => onDelete(_id)}
          className="p-2 rounded-md bg-slate-800 hover:bg-rose-700 transition"
        >
          <TrashIcon className="h-4 w-4 text-rose-300" />
        </button>
      </div>
    </div>
  );
}
