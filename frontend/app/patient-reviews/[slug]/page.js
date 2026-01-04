"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { apiGet } from "@/lib/api";
import Container from "@/components/Container";

function Stars({ rating = 0 }) {
  const count = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  return (
    <div className="flex items-center gap-1 text-amber-500">
      {"★★★★★".slice(0, count)}
      <span className="text-xs text-slate-500 ml-1">{count ? `${count}/5` : ""}</span>
    </div>
  );
}

export default function PatientReviewDetailPage() {
  const params = useParams();
  const slug = params?.slug;
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);
  const [slide, setSlide] = useState(0);
  const [videoSlide, setVideoSlide] = useState(0);
  const images = review?.images || [];
  const hasVideo = Boolean(review?.videoUrl);
  const videos = Array.isArray(review?.videoUrls)
    ? (review.videoUrls || []).filter(Boolean)
    : review?.videoUrl
    ? [review.videoUrl]
    : [];
  const videoPoster = review?.videoCoverImage || undefined;

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await apiGet(`/patient-reviews/${slug}`);
        setReview(res?.data || res);
      } catch (_) {
        setReview(null);
      } finally {
        setLoading(false);
      }
    }
    if (slug) load();
  }, [slug]);

  useEffect(() => {
    if (!images.length || images.length <= 3) return undefined;
    const id = setInterval(() => {
      setSlide((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(id);
  }, [images.length]);

  useEffect(() => {
    if (videos.length <= 1) return undefined;
    const id = setInterval(() => {
      setVideoSlide((prev) => (prev + 1) % videos.length);
    }, 6000);
    return () => clearInterval(id);
  }, [videos.length]);

  const fullText =
    typeof (review?.fullReviewHtml || review?.fullReview) === "string"
      ? (review.fullReviewHtml || review.fullReview).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
      : "";

  const youtubeIdFromUrl = (url) => {
    if (!url) return null;
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes("youtu.be")) {
        return parsed.pathname.replace("/", "") || null;
      }
      if (parsed.hostname.includes("youtube.com")) {
        const v = parsed.searchParams.get("v");
        if (v) return v;
        // handle /embed/VIDEO_ID
        const parts = parsed.pathname.split("/");
        const embedIndex = parts.findIndex((p) => p === "embed");
        if (embedIndex >= 0 && parts[embedIndex + 1]) return parts[embedIndex + 1];
      }
    } catch (_) {
      return null;
    }
    return null;
  };

  if (loading) {
    return <p className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-500">Loading review...</p>;
  }

  if (!review) {
    return <p className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-500">Review not found.</p>;
  }

  return (
    <Container className="py-12 space-y-10">
      <header className="space-y-4">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">Patient Review</p>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">{review.headline}</h1>
        <div className="flex items-center gap-3 text-slate-700">
          <span className="font-semibold text-lg">{review.patientName || "Anonymous"}</span>
          {review.country ? <span className="text-sm text-slate-500">· {review.country}</span> : null}
          <Stars rating={review.rating} />
        </div>
        {review.associatedProgram ? (
          <p className="text-sm text-slate-500">Program / Package: {review.associatedProgram}</p>
        ) : null}
      </header>

      {images.length > 0 && (
        <section className="space-y-4">
          {images.length > 3 ? (
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-3 shadow-sm">
              <div className="flex gap-3">
                {Array.from({ length: 3 }).map((_, idx) => {
                  const img = images[(slide + idx) % images.length];
                  const key = `${img.url || img}-${idx}`;
                  return (
                    <button
                      key={key}
                      type="button"
                      className="relative flex-1 min-w-0 aspect-[4/3] overflow-hidden rounded-xl border border-slate-200 bg-slate-100 hover:opacity-90 transition"
                      onClick={() => setLightbox(img.url || img)}
                    >
                      <Image
                        src={img.url || img}
                        alt={img.caption || `Review image ${((slide + idx) % images.length) + 1}`}
                        fill
                        sizes="(max-width: 768px) 33vw, 33vw"
                        className="object-cover"
                        loading="lazy"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="relative aspect-[4/3] overflow-hidden rounded-xl border border-slate-200 bg-slate-100 hover:opacity-90 transition"
                  onClick={() => setLightbox(img.url || img)}
                >
                  <Image
                    src={img.url || img}
                    alt={img.caption || `Review image ${idx + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">Full review</h2>
        <p className="text-slate-700 leading-relaxed whitespace-pre-line">{fullText}</p>
      </section>

      {videos.length > 0 && (
        <section className="relative w-full overflow-hidden rounded-2xl bg-black shadow-sm border border-slate-200">
          {(() => {
            const current = videos[videoSlide];
            const ytId = youtubeIdFromUrl(current);
            if (ytId) {
              return (
                <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                  <iframe
                    key={ytId}
                    src={`https://www.youtube.com/embed/${ytId}?rel=0`}
                    title="Review video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
              );
            }
            return (
              <video
                key={current}
                src={current}
                controls
                poster={videoPoster}
                className="w-full h-full max-h-[520px] object-contain bg-black"
              />
            );
          })()}
        </section>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-4xl w-full">
            <Image
              src={lightbox}
              alt="Review media"
              width={1600}
              height={900}
              className="w-full h-auto rounded-2xl"
            />
          </div>
        </div>
      )}
    </Container>
  );
}
