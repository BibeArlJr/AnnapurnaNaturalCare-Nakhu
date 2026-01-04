"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { apiGet } from "@/lib/api";
import HealthProgramBookingModal from "@/components/health-programs/HealthProgramBookingModal";

export default function HealthProgramDetail() {
  const params = useParams();
  const [program, setProgram] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiGet(`/health-programs/${params.slug}`);
        setProgram(res?.data || res || null);
      } catch (err) {
        console.error("Health program load error:", err);
      }
    };
    if (params?.slug) load();
  }, [params?.slug]);

  const gallery = useMemo(() => program?.galleryImages || [], [program?.galleryImages]);
  const videos = useMemo(() => {
    const list = Array.isArray(program?.promoVideos) ? program.promoVideos : [];
    return list
      .map((v) => (typeof v === "string" ? v : v?.url))
      .filter(Boolean);
  }, [program?.promoVideos]);
  const primaryVideo = program?.videoUrl || videos[0] || null;
  const heroImages = useMemo(() => {
    const imgs = gallery.length ? gallery : [];
    const cover = program?.coverImage || "/images/hero-placeholder.jpg";
    return imgs.length ? imgs : [cover];
  }, [gallery, program?.coverImage]);
  const [heroIdx, setHeroIdx] = useState(0);

  useEffect(() => {
    if (!heroImages.length) return;
    const timer = setInterval(() => {
      setHeroIdx((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const sections = useMemo(() => {
    const base = [
      { id: "overview", label: "Overview" },
      { id: "inclusions", label: "Inclusions" },
      { id: "outcomes", label: "Outcomes" },
      { id: "join", label: "Join this program" },
    ];
    if (gallery.length) base.push({ id: "gallery", label: "Gallery" });
    if (primaryVideo) base.push({ id: "video", label: "Video" });
    return base;
  }, [gallery.length, primaryVideo]);

  const scrollTo = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const isLoading = !program;
  const title = program?.title || "Health Program";
  const shortDescription = program?.shortDescription || "";

  return (
    <div className="relative">
      <section className="relative h-screen min-h-screen w-full overflow-hidden">
        <div className="absolute inset-0">
          {heroImages.map((src, idx) => {
            const isActive = idx === heroIdx;
            return (
              <img
                key={`${src}-${idx}`}
                src={src}
                alt={title || `Program ${idx + 1}`}
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  opacity: isActive ? 1 : 0,
                  transition: "opacity 1.2s ease, transform 8s ease",
                  transform: isActive ? "scale(1.05)" : "scale(1)",
                }}
              />
            );
          })}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
        <div className="relative z-10 flex h-full items-center">
          <div className="w-full max-w-6xl mx-auto px-6 sm:px-10">
            <div className="max-w-4xl space-y-4 text-white">
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs tracking-[0.25em] uppercase">
                Health Program
              </span>
              <h1 className="text-4xl sm:text-5xl font-semibold leading-tight">{title}</h1>
              {shortDescription ? (
                <p className="text-base sm:text-lg text-white/90 leading-relaxed">{shortDescription}</p>
              ) : null}
              <button
                onClick={() => setOpen(true)}
                className="mt-2 inline-flex items-center justify-center px-6 py-3 rounded-full bg-teal-500 hover:bg-teal-400 text-white font-semibold shadow-lg transition"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="w-full max-w-6xl xl:max-w-6xl 2xl:max-w-[1200px] mx-auto px-4 sm:px-6 py-12 space-y-12">
        {isLoading ? (
          <div className="text-sm text-[#4c5f68]">Loading...</div>
        ) : null}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          <div className="rounded-2xl border border-[#dfe8e2] bg-white shadow-sm p-5 space-y-3" id="inclusions">
            <h3 className="text-lg font-semibold text-[#0f1f17]">Inclusions</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-none">
              {(program?.inclusions || []).map((inc, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-[#1d3329]">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[#2F8D59]" />
                  <span>{inc}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-[#dfe8e2] bg-white shadow-sm p-5 space-y-3" id="outcomes">
            <h3 className="text-lg font-semibold text-[#0f1f17]">Outcomes</h3>
            {program?.outcomes?.length ? (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-none">
                {(program.outcomes || []).map((o, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-[#1d3329]">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[#2F8D59]" />
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[#4c5f68]">Outcomes will be added soon.</p>
            )}
          </div>

        <div className="space-y-4" id="join">
            <div className="rounded-2xl border border-[#dfe8e2] bg-white shadow-sm p-5 space-y-4 sticky top-6">
              <div className="flex items-center justify-between">
                <p className="text-sm uppercase tracking-[0.2em] text-[#2F8D59] font-semibold">Join this program</p>
                {program?.durationInDays ? (
                  <span className="text-xs text-[#4c5f68] font-medium">{program.durationInDays} days</span>
                ) : null}
              </div>
              <p className="text-xs text-[#4c5f68] font-medium">Choose how you want to attend</p>
              <div className="space-y-2">
                {(program?.modesAvailable || []).map((mode) => {
                  const labelMap = {
                    online: "Learn and participate from home",
                    residential: "Stay at our hospital during the program",
                    dayVisitor: "Visit daily without overnight stay",
                  };
                  const display = mode === "dayVisitor" ? "Day Visitor" : mode.charAt(0).toUpperCase() + mode.slice(1);
                  return (
                    <div
                      key={mode}
                      className="flex items-center justify-between rounded-xl border border-[#e3ebe5] px-3 py-3 hover:border-[#2F8D59] hover:shadow transition"
                    >
                      <div>
                        <p className="font-semibold text-[#0f1f17]">{display}</p>
                        <p className="text-xs text-[#4c5f68]">{labelMap[mode] || ""}</p>
                      </div>
                      <p className="text-lg font-bold text-[#2F8D59]">${program?.pricing?.[mode] || 0}</p>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => setOpen(true)}
                className="w-full rounded-full bg-[#2F8D59] hover:bg-[#27784c] text-white font-semibold py-3 transition"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#dfe8e2] bg-white shadow-sm p-6 space-y-3" id="overview">
          <h2 className="text-xl font-semibold text-[#0f1f17]">Overview</h2>
          <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: program?.longDescription || "" }} />
        </div>

        {primaryVideo ? (
          <div className="rounded-2xl border border-[#dfe8e2] bg-white shadow-sm p-4" id="video">
            <h3 className="text-sm uppercase tracking-[0.2em] text-[#4c5f68] font-semibold mb-3">Program Video</h3>
            {(() => {
              const isEmbed = /youtube\.com|youtu\.be|vimeo\.com/.test(primaryVideo || "");
              if (isEmbed) {
                let src = primaryVideo;
                if (src.includes("watch?v=")) src = src.replace("watch?v=", "embed/");
                else if (src.includes("youtu.be/")) {
                  const id = src.split("youtu.be/")[1]?.split(/[?&]/)[0];
                  if (id) src = `https://www.youtube.com/embed/${id}`;
                } else if (src.includes("youtube.com/shorts/")) {
                  const id = src.split("youtube.com/shorts/")[1]?.split(/[?&]/)[0];
                  if (id) src = `https://www.youtube.com/embed/${id}`;
                } else if (src.includes("vimeo.com/")) {
                  const id = src.split("vimeo.com/")[1]?.split(/[?&]/)[0];
                  if (id) src = `https://player.vimeo.com/video/${id}`;
                }
                return (
                  <iframe
                    src={src}
                    className="w-full aspect-video rounded-xl border border-[#dfe8e2]"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Program video"
                  />
                );
              }
              return (
                <video
                  src={primaryVideo}
                  controls
                  muted
                  className="w-full rounded-xl border border-[#dfe8e2]"
                />
              );
            })()}
          </div>
        ) : null}

      </div>

      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 md:right-8 z-40 shadow-xl rounded-full bg-teal-600 hover:bg-teal-500 text-white font-semibold px-5 py-3"
      >
        Book Now
      </button>

      {open && <HealthProgramBookingModal program={program} open={open} onClose={() => setOpen(false)} />}
    </div>
  );
}
