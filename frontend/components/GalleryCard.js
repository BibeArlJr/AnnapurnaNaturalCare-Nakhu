function pickPreview(item) {
  if (item.images?.length) return { type: "image", src: item.images[0] };
  if (item.videos?.length) return { type: "video", src: item.videos[0] };
  if (item.youtubeLinks?.length) return { type: "youtube", src: item.youtubeLinks[0] };
  return null;
}

export default function GalleryCard({ item }) {
  const preview = pickPreview(item);

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden shadow hover:border-teal-600/40 transition bg-[#0f131a]">
      <div className="h-56 bg-slate-900">
        {preview?.type === "image" && (
          <img src={preview.src} alt={item.title || "Gallery"} className="w-full h-full object-cover" />
        )}
        {preview?.type === "video" && (
          <video src={preview.src} controls className="w-full h-full object-cover" />
        )}
        {preview?.type === "youtube" && (
          <iframe
            src={preview.src}
            className="w-full h-full"
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
      <div className="p-4 space-y-2">
        {item.title ? <h2 className="text-lg font-semibold text-white">{item.title}</h2> : null}
        {item.description ? <p className="text-slate-300 text-sm">{item.description}</p> : null}
        <div className="text-xs text-slate-500">
          {(item.images?.length || 0)} photos · {(item.videos?.length || 0)} videos ·{" "}
          {(item.youtubeLinks?.length || 0)} YouTube
        </div>
      </div>
    </div>
  );
}
