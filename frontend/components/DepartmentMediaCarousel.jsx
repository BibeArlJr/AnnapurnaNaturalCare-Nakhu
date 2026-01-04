"use client";

import { useEffect, useMemo, useState } from "react";

export default function DepartmentMediaCarousel({ images = [] }) {
  const items = useMemo(
    () =>
      (images || [])
        .map((img) => (typeof img === "string" ? img : img?.url))
        .filter(Boolean),
    [images]
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return undefined;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(id);
  }, [items.length]);

  if (!items.length) return null;

  return (
    <div className="relative w-full aspect-[16/10] md:aspect-[4/3] max-h-[320px] rounded-xl overflow-hidden bg-[#e3ece6] border border-[#cfe8d6]">
      <img src={items[index]} alt="Department visual" className="w-full h-full object-cover" loading="lazy" />
      {items.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={() => setIndex((prev) => (prev - 1 + items.length) % items.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/40 text-white backdrop-blur flex items-center justify-center hover:bg-black/60 transition"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={() => setIndex((prev) => (prev + 1) % items.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/40 text-white backdrop-blur flex items-center justify-center hover:bg-black/60 transition"
          >
            ›
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2.5 w-2.5 rounded-full transition ${
                  i === index ? "bg-white shadow-md" : "bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
