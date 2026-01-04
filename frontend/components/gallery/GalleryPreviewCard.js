"use client";

import { useMemo } from "react";

export default function GalleryPreviewCard({ item, onOpen }) {
  const images = Array.isArray(item?.images) ? item.images : [];
  const videos = Array.isArray(item?.videos) ? item.videos : [];
  const youtubeLinks = Array.isArray(item?.youtubeLinks) ? item.youtubeLinks : [];

  const previewMedia = useMemo(() => {
    const list = [
      ...images.map((src) => ({ type: "image", src })),
      ...videos.map((src) => ({ type: "video", src })),
      ...youtubeLinks.map((src) => ({ type: "youtube", src })),
    ].filter((m) => m?.src);
    return list.slice(0, 4);
  }, [images, videos, youtubeLinks]);

  const thumbSrc = (m) => m?.src || "";

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group w-full text-left overflow-hidden rounded-2xl border border-[#dfe8e2] bg-white hover:shadow-lg hover:shadow-[#2F8D59]/12 transition transform hover:-translate-y-0.5"
    >
      <div className="overflow-hidden">
        <div className="grid grid-cols-2 grid-rows-2 gap-1 aspect-[3/2] bg-[#e8f0ea]">
          {previewMedia.length === 0 && <div className="col-span-2 row-span-2 bg-[#e8f0ea]" />}

          {previewMedia.length === 1 && (
            <div className="col-span-2 row-span-2 relative">
              <img
                src={thumbSrc(previewMedia[0])}
                alt={item?.title || "Gallery image"}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {previewMedia[0].type !== "image" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <span className="text-white text-2xl">▶</span>
                </div>
              )}
            </div>
          )}

          {previewMedia.length > 1 &&
            previewMedia.map((media, idx) => (
              <div key={idx} className="relative">
                <img
                  src={thumbSrc(media)}
                  alt={item?.title || "Gallery image"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {media.type !== "image" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <span className="text-white text-lg">▶</span>
                  </div>
                )}
              </div>
            ))}
        </div>
        <div className="p-3 space-y-1">
          {item?.title && (
            <p className="text-[#10231a] text-sm font-semibold line-clamp-1">{item.title}</p>
          )}
          {item?.description && (
            <p className="text-[#4c5f68] text-xs line-clamp-2">{item.description}</p>
          )}
        </div>
      </div>
    </button>
  );
}
