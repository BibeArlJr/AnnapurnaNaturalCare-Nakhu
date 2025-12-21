"use client";

import { useEffect, useState } from "react";

function extractYouTubeId(url = "") {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.replace("/", "");
    }
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      const parts = u.pathname.split("/");
      return parts[parts.length - 1];
    }
  } catch {
    return "";
  }
  return "";
}

export default function MediaCarousel({
  items = [],
  type = "image",
  title,
  autoSlideInterval = 0,
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!autoSlideInterval || items.length <= 1) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, autoSlideInterval);
    return () => clearInterval(id);
  }, [autoSlideInterval, items.length]);

  if (!items || items.length === 0) {
    const label = type === "image" ? "photos" : type === "video" ? "videos" : "YouTube videos";
    return (
      <div className="border border-white/10 bg-[#0f131a] rounded-xl p-4 text-sm text-slate-400">
        No {label} to display.
      </div>
    );
  }

  const current = items[index];

  const dotsClasses = (i) =>
    `w-2.5 h-2.5 rounded-full transition ${
      i === index ? "bg-[#2F8D59]" : "bg-[#cfe8d6] hover:bg-[#a9d3b8]"
    }`;

  return (
    <div className="w-full space-y-3">
      <div className="relative border border-[#dfe8e2] bg-white rounded-2xl overflow-hidden">
        <div className="aspect-video w-full flex items-center justify-center bg-black">
          {type === "image" && (
            <img
              src={current}
              alt={title || "Gallery image"}
              className="w-full h-full object-contain max-h-[640px] bg-black"
              loading="lazy"
            />
          )}

          {type === "video" && (
            <video
              src={current}
              className="w-full h-full object-contain max-h-[640px] bg-black"
              controls
            />
          )}

          {type === "youtube" && (
            <div className="w-full h-full">
              <iframe
                className="w-full h-full"
                src={
                  extractYouTubeId(current)
                    ? `https://www.youtube.com/embed/${extractYouTubeId(current)}`
                    : current
                }
                title={title || "YouTube video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>

        {items.length > 1 && (
          <>
            <button
              onClick={() => setIndex((prev) => (prev - 1 + items.length) % items.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 text-[#10231a] w-9 h-9 flex items-center justify-center hover:bg-white"
              aria-label="Previous"
              type="button"
            >
              ‹
            </button>
            <button
              onClick={() => setIndex((prev) => (prev + 1) % items.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 text-[#10231a] w-9 h-9 flex items-center justify-center hover:bg-white"
              aria-label="Next"
              type="button"
            >
              ›
            </button>
          </>
        )}
      </div>

      {items.length > 1 && (
        <div className="flex justify-center gap-1">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={dotsClasses(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
