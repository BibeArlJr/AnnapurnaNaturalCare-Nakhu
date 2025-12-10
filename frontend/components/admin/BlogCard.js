"use client";

import Link from "next/link";
import { PencilSquareIcon, TrashIcon, NewspaperIcon } from "@heroicons/react/24/solid";
import dayjs from "dayjs";

export default function BlogCard({ post, onDelete }) {
  const created = post?.createdAt ? dayjs(post.createdAt).format("MMM D, YYYY") : "";
  const excerpt =
    post?.shortDescription ||
    (post?.content ? `${post.content.slice(0, 100)}${post.content.length > 100 ? "..." : ""}` : "");
  const categoryName = post?.categoryId?.name || post?.category || "";

  return (
    <div className="relative bg-[#11151c] border border-white/10 rounded-xl p-5 hover:border-teal-600/40 transition shadow-sm">
      <div className="absolute top-3 right-3 flex gap-2">
        <Link
          href={`/admin/blogs/${post._id}`}
          className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 transition"
          title="Edit"
        >
          <PencilSquareIcon className="h-5 w-5 text-teal-300" />
        </Link>
        <button
          onClick={() => onDelete?.(post._id)}
          className="p-2 rounded-md bg-slate-800 hover:bg-rose-700 transition"
          title="Delete"
        >
          <TrashIcon className="h-5 w-5 text-rose-300" />
        </button>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="h-20 w-28 rounded-lg overflow-hidden border border-slate-800 bg-slate-900 flex items-center justify-center">
          {post?.coverImage ? (
            <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover" />
          ) : (
            <NewspaperIcon className="h-10 w-10 text-slate-600" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs px-2 py-1 rounded-full border ${
                post.status === "published"
                  ? "border-teal-500/50 bg-teal-600/10 text-teal-200"
                  : "border-slate-600 bg-slate-800 text-slate-200"
              }`}
            >
              {post.status || "draft"}
            </span>
            {categoryName && (
              <span className="text-xs px-2 py-1 rounded-full bg-teal-600/15 text-teal-200 border border-teal-600/30">
                {categoryName}
              </span>
            )}
            {created && <span className="text-xs text-slate-500">Created {created}</span>}
          </div>
          <h3 className="text-lg font-semibold text-white line-clamp-1">{post.title}</h3>
          {post?.category && (
            <p className="text-xs text-teal-300 uppercase tracking-wide mt-1">{post.category}</p>
          )}
        </div>
      </div>

      <p className="text-gray-400 text-sm line-clamp-3">{excerpt || "No excerpt available."}</p>
    </div>
  );
}
