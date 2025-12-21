"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function GalleryPreviewCard({ item }) {
  const images = Array.isArray(item?.images) ? item.images : [];
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (images.length <= 1 || paused) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3600);
    return () => clearInterval(id);
  }, [images.length, paused]);

  const current = images[index] || "";
  const href = `/gallery/${item?.slug || item?._id}`;

  return (
    <Link
      href={href}
      className="group w-full overflow-hidden rounded-2xl border border-[#dfe8e2] bg-white hover:shadow-lg hover:shadow-[#2F8D59]/10 transition"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {current ? (
          <img
            src={current}
            alt={item?.title || "Gallery image"}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-[#e8f0ea]" />
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent p-3 opacity-0 group-hover:opacity-100 transition">
          {item?.title && (
            <p className="text-white text-sm font-semibold line-clamp-1">{item.title}</p>
          )}
          {item?.description && (
            <p className="text-white/80 text-xs line-clamp-2">{item.description}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
