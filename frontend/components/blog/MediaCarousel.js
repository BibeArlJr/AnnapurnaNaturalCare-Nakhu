"use client";

import { useEffect, useMemo, useState } from "react";

export default function MediaCarousel({ media = [] }) {
  const items = useMemo(() => (Array.isArray(media) ? media : []), [media]);
  const [index, setIndex] = useState(0);
  const autoInterval = 4000;

  useEffect(() => {
    if (items.length <= 1) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, autoInterval);
    return () => clearInterval(id);
  }, [items.length, autoInterval]);

  if (!items.length) return null;

  const current = items[index];

  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + items.length) % items.length);
  };
  const handleNext = () => {
    setIndex((prev) => (prev + 1) % items.length);
  };

  const renderMedia = (item) => {
    return (
      <div className="relative w-full overflow-hidden rounded-xl" style={{ paddingTop: "56.25%" }}>
        {item.type === "youtube" ? (
          <iframe
            src={item.src}
            title="Blog media"
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : item.type === "video" ? (
          <video
            src={item.src}
            controls
            className="absolute inset-0 w-full h-full object-cover rounded-xl"
          />
        ) : (
          <img
            src={item.src}
            alt=""
            className="absolute inset-0 w-full h-full rounded-xl object-cover"
          />
        )}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="relative w-full rounded-2xl bg-white shadow-sm border border-[#dfe8e2] overflow-hidden">
        <div className="w-full">{renderMedia(current)}</div>
        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#10231a] rounded-full shadow px-3 py-2"
            >
              ←
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#10231a] rounded-full shadow px-3 py-2"
            >
              →
            </button>
          </>
        )}
      </div>

      {items.length > 1 && (
        <div className="flex items-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 w-2 rounded-full transition ${
                i === index ? "bg-[#2F8D59]" : "bg-[#dfe8e2] hover:bg-[#b7d0c2]"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
