"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import GalleryPreviewCard from "./GalleryPreviewCard";

function ModalCarousel({ item, onClose }) {
  const media = useMemo(() => {
    const images = (item?.images || []).map((src) => ({ type: "image", src }));
    const videos = (item?.videos || []).map((src) => ({ type: "video", src }));
    const youtubeLinks = (item?.youtubeLinks || []).map((src) => ({ type: "youtube", src }));
    return [...images, ...videos, ...youtubeLinks].filter((m) => m?.src);
  }, [item]);

  const [index, setIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);

  const hasMedia = media.length > 0;
  const current = hasMedia ? media[index] : null;

  const next = useCallback(() => {
    if (!hasMedia) return;
    setIndex((prev) => (prev + 1) % media.length);
  }, [hasMedia, media.length]);

  const prev = useCallback(() => {
    if (!hasMedia) return;
    setIndex((prev) => (prev - 1 + media.length) % media.length);
  }, [hasMedia, media.length]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, onClose]);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl bg-white rounded-2xl overflow-hidden border border-[#dfe8e2]"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStart === null) return;
          const delta = e.changedTouches[0].clientX - touchStart;
          if (Math.abs(delta) > 50) {
            delta > 0 ? prev() : next();
          }
          setTouchStart(null);
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-black/60 text-white rounded-full px-3 py-1 text-sm hover:bg-black/80"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="pt-10 pb-4 px-6 text-center space-y-2">
          {item?.title && <p className="text-xl font-semibold text-[#10231a]">{item.title}</p>}
          {item?.description && (
            <p className="text-sm text-[#4c5f68] line-clamp-2 mx-auto max-w-3xl">{item.description}</p>
          )}
        </div>

        <div className="relative px-4 pb-6">
          <div className="w-full overflow-hidden rounded-xl border border-[#dfe8e2] bg-[#0b0d10]">
            {current?.type === "image" && (
              <div className="w-full flex items-center justify-center bg-black">
                <img
                  src={current.src}
                  alt={item?.title || "Gallery image"}
                  className="w-full max-h-[70vh] object-contain"
                />
              </div>
            )}
            {current?.type === "youtube" && (
              <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                <iframe
                  src={current.src}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={item?.title || "Gallery video"}
                />
              </div>
            )}
          </div>

          {media.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 text-[#10231a] rounded-full w-10 h-10 flex items-center justify-center shadow hover:bg-white"
                aria-label="Previous"
              >
                ←
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 text-[#10231a] rounded-full w-10 h-10 flex items-center justify-center shadow hover:bg-white"
                aria-label="Next"
              >
                →
              </button>
            </>
          )}
        </div>

        {media.length > 1 && (
          <div className="pb-4 flex justify-center gap-2">
            {media.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2 w-2 rounded-full transition ${
                  i === index ? "bg-[#2F8D59]" : "bg-[#dfe8e2] hover:bg-[#b7d0c2]"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function GalleryGrid({ items = [] }) {
  const [openItem, setOpenItem] = useState(null);

  if (!items || items.length === 0) {
    return (
      <div className="bg-white border border-[#dfe8e2] rounded-2xl p-8 text-center text-[#4c5f68]">
        No gallery items yet. Please check back soon.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5 md:gap-6">
        {items.map((item) => (
          <GalleryPreviewCard key={item._id} item={item} onOpen={() => setOpenItem(item)} />
        ))}
      </div>

      {openItem && <ModalCarousel item={openItem} onClose={() => setOpenItem(null)} />}
    </>
  );
}
