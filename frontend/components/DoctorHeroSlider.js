'use client';

import { useEffect, useMemo, useState } from 'react';

export default function DoctorHeroSlider({ primaryImage, galleryImages = [], name = 'Doctor' }) {
  const media = useMemo(() => {
    const list = [];
    if (primaryImage) {
      list.push({ src: primaryImage, alt: name });
    }
    (galleryImages || []).forEach((img, idx) => {
      if (img) {
        list.push({ src: img, alt: `${name} ${idx + 1}` });
      }
    });
    return list;
  }, [galleryImages, name, primaryImage]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [primaryImage, galleryImages?.length]);

  if (!media.length) {
    return (
      <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-white/10 border-4 border-white flex items-center justify-center text-neutral-300">
        No Photo
      </div>
    );
  }

  return (
    <div className="relative w-48 h-48 md:w-56 md:h-56">
      <div className="w-full h-full rounded-full bg-white shadow-lg overflow-hidden border-4 border-white">
        <img src={media[index].src} alt={media[index].alt || name} className="w-full h-full object-cover" />
      </div>
      {media.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setIndex((prev) => (prev - 1 + media.length) % media.length)}
            className="absolute -left-10 top-1/2 -translate-y-1/2 bg-white/80 border border-white/50 shadow rounded-full p-2 text-neutral-800 hover:bg-white"
            aria-label="Previous photo"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => setIndex((prev) => (prev + 1) % media.length)}
            className="absolute -right-10 top-1/2 -translate-y-1/2 bg-white/80 border border-white/50 shadow rounded-full p-2 text-neutral-800 hover:bg-white"
            aria-label="Next photo"
          >
            →
          </button>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-2 bg-white/90 px-3 py-1 rounded-full shadow">
            {media.map((item, idx) => (
              <button
                key={item.src + idx}
                type="button"
                onClick={() => setIndex(idx)}
                className={`h-2 w-2 rounded-full transition ${
                  idx === index ? 'bg-emerald-700' : 'bg-emerald-700/40'
                }`}
                aria-label={`View ${item.alt || `image ${idx + 1}`}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
