"use client";

import { useState } from "react";
import MediaUploader from "@/components/admin/MediaUploader";

export default function MediaSection({
  title = "Media",
  images = [],
  setImages,
  videos = [],
  setVideos,
  maxImages = 10,
  maxVideos = 3,
}) {
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadingVid, setUploadingVid] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-300 font-semibold">{title}</p>
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>

      <div className="space-y-2">
        <p className="text-xs text-slate-400">Gallery images (max {maxImages})</p>
        <MediaUploader
          accept="image/*"
          maxItems={maxImages}
          value={images}
          onChange={(list) => {
            setError("");
            setImages(list);
          }}
          onUploadStart={() => setUploadingImg(true)}
          onUploadEnd={() => setUploadingImg(false)}
          onError={(msg) => setError(msg || "Upload failed")}
          disabled={uploadingImg}
        />
      </div>

      <div className="space-y-2">
        <p className="text-xs text-slate-400">Promo videos (max {maxVideos})</p>
        <MediaUploader
          accept="video/*"
          maxItems={maxVideos}
          value={videos}
          onChange={(list) => {
            setError("");
            setVideos(list);
          }}
          onUploadStart={() => setUploadingVid(true)}
          onUploadEnd={() => setUploadingVid(false)}
          onError={(msg) => setError(msg || "Upload failed")}
          disabled={uploadingVid}
        />
      </div>
    </div>
  );
}
