"use client";

import { useEffect, useMemo, useState } from "react";

function normalizeVideos(videos = []) {
  return videos
    .map((v) => (typeof v === "string" ? v : v?.url))
    .filter(Boolean);
}

export default function DepartmentVideoCarousel({ videos }) {
  const items = useMemo(() => normalizeVideos(videos), [videos]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return undefined;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(id);
  }, [items.length]);

  if (!items.length) return null;

  const current = items[index];
  const isYouTube = /youtube\.com|youtu\.be/.test(current);
  const embedUrl = isYouTube
    ? current.replace("watch?v=", "embed/").replace("youtu.be/", "www.youtube.com/embed/")
    : current;

  return (
    <div className="space-y-3">
      <div className="relative w-full overflow-hidden rounded-2xl border border-[#cfe8d6] bg-white shadow-sm">
        {isYouTube ? (
          <iframe
            src={embedUrl}
            className="w-full aspect-video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Department video"
          />
        ) : (
          <video
            src={current}
            controls
            className="w-full h-full max-h-[460px] bg-black rounded-2xl"
            preload="metadata"
          />
        )}
      </div>
      {items.length > 1 && (
        <div className="flex items-center justify-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-2.5 w-2.5 rounded-full ${i === index ? "bg-[#2F8D59]" : "bg-[#cfe8d6]"}`}
              aria-label={`Video ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
