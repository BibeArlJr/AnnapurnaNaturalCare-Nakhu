"use client";

import Container from "@/components/Container";
import { apiGet } from "@/lib/api";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import PackageBookingModal from "@/components/packages/PackageBookingModal";
import { useEffect, useMemo, useRef, useState } from "react";

export default function PackageDetailPage() {
  const params = useParams();
  const { slug } = params || {};
  const router = useRouter();

  const [pkg, setPkg] = useState(null);
  const [priceLabel, setPriceLabel] = useState("Contact for pricing");
  const [benefit, setBenefit] = useState("");
  const [bestFor, setBestFor] = useState("");
  const [open, setOpen] = useState(false);
  const [others, setOthers] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [canToggleDesc, setCanToggleDesc] = useState(false);
  const descRef = useRef(null);
  const [activeMediaIdx, setActiveMediaIdx] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const [currentRes, allRes] = await Promise.all([
          apiGet(`/packages/${slug}`),
          apiGet("/packages"),
        ]);
        const data = currentRes?.data || currentRes;
        if (!data) {
          router.replace("/404");
          return;
        }
        setPkg(data);
        setPriceLabel(data?.price && Number(data.price) > 0 ? `$${data.price}` : "Contact for pricing");
        setBenefit(data?.benefit || data?.benefitLine || data?.shortDescription);
        setBestFor(data?.bestFor || data?.recommendedFor);
        const list = (allRes?.data || allRes || []).filter((p) => p._id !== data._id && p.slug !== data.slug);
        setOthers(list);
        setExpanded(false);
      } catch (err) {
        console.error("Package detail load error:", err);
        router.replace("/404");
      }
    }
    if (slug) {
      load();
    }
  }, [slug]);

  useEffect(() => {
    const el = descRef.current;
    if (!el || !benefit) {
      setCanToggleDesc(false);
      return;
    }
    // measure overflow with clamp applied
    el.classList.add("line-clamp-3");
    const needsClamp = el.scrollHeight > el.clientHeight + 1;
    setCanToggleDesc(needsClamp);
    if (expanded) {
      el.classList.remove("line-clamp-3");
    }
  }, [benefit, expanded]);
  const cover = pkg?.imageUrl || (pkg?.images?.[0] ?? "");
  const mediaImages = useMemo(() => {
    const imgs = [];
    if (cover) imgs.push({ src: cover, alt: pkg?.name || "Health package" });
    (pkg?.galleryImages || []).forEach((img, idx) => {
      if (img) imgs.push({ src: img, alt: `${pkg?.name || "Health package"} ${idx + 1}` });
    });
    return imgs;
  }, [cover, pkg?.galleryImages, pkg?.name]);

  useEffect(() => {
    setActiveMediaIdx(0);
  }, [pkg?._id, mediaImages.length]);

  const promoVideos = useMemo(() => {
    const toUrl = (entry) => {
      if (!entry) return null;
      if (typeof entry === "string") return entry;
      if (entry.url) return entry.url;
      return null;
    };
    const base = Array.isArray(pkg?.promoVideos) ? pkg.promoVideos : [];
    const fallback = pkg?.promoVideo ? [pkg.promoVideo] : [];
    const extra = pkg?.videoUrl ? [pkg.videoUrl] : [];
    return [...base, ...fallback, ...extra].map(toUrl).filter(Boolean);
  }, [pkg?.promoVideos, pkg?.promoVideo, pkg?.videoUrl]);

  const toEmbedUrl = (url = "") => {
    if (!url) return "";
    if (url.includes("youtube.com/watch")) {
      return url.replace("watch?v=", "embed/");
    }
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split(/[?&]/)[0];
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    if (url.includes("youtube.com/shorts/")) {
      const id = url.split("youtube.com/shorts/")[1]?.split(/[?&]/)[0];
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    if (url.includes("vimeo.com/")) {
      const id = url.split("vimeo.com/")[1]?.split(/[?&]/)[0];
      return id ? `https://player.vimeo.com/video/${id}` : url;
    }
    return url;
  };

  const renderVideo = (url, idx) => {
    const isEmbed = /youtube\.com|youtu\.be|vimeo\.com/.test(url || "");
    if (isEmbed) {
      const src = toEmbedUrl(url);
      return (
        <iframe
          key={`${url}-${idx}`}
          src={src}
          className="w-full aspect-video rounded-xl border border-[#dfe8e2]"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }
    return (
      <video
        key={`${url}-${idx}`}
        src={url}
        controls
        className="w-full rounded-xl border border-[#dfe8e2]"
      />
    );
  };
  const durationLabel = pkg?.duration || pkg?.durationDays || pkg?.days;
  if (!pkg) {
    return null;
  }
  const normalizeIncluded = (raw) => {
    const parts = [];
    const addParts = (val) => {
      if (!val) return;
      const str = val.toString();
      const primary = str.split(/[,\n]+/);
      const base = primary.length > 1 ? primary : str.split(/\s+/);
      base.forEach((item) => {
        const clean = (item || "").toString().trim();
        if (clean) parts.push(clean);
      });
    };
    if (Array.isArray(raw)) raw.forEach(addParts);
    else if (typeof raw === "string") addParts(raw);
    return parts;
  };

  return (
    <div className="bg-[#f5f8f4] min-h-screen">
      <Container className="py-14 md:py-18">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
          <div className="flex flex-col gap-6">
            <div className="bg-white border border-[#dfe8e2] rounded-2xl p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-6 items-stretch">
                <div className="w-full rounded-2xl overflow-hidden bg-[#e6f2ea] relative aspect-[4/3] min-h-[260px]">
                  {mediaImages.length ? (
                    <>
                      <img
                        src={mediaImages[activeMediaIdx]?.src}
                        alt={mediaImages[activeMediaIdx]?.alt || pkg?.name || "Health package"}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      {mediaImages.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMediaIdx((prev) => (prev - 1 + mediaImages.length) % mediaImages.length)
                            }
                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 border border-[#dfe8e2] shadow-sm rounded-full p-2 text-[#10231a] hover:bg-white"
                            aria-label="Previous image"
                          >
                            ←
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveMediaIdx((prev) => (prev + 1) % mediaImages.length)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 border border-[#dfe8e2] shadow-sm rounded-full p-2 text-[#10231a] hover:bg-white"
                            aria-label="Next image"
                          >
                            →
                          </button>
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 bg-white/90 px-3 py-1 rounded-full shadow-sm">
                            {mediaImages.map((img, idx) => (
                              <button
                                key={img.src + idx}
                                type="button"
                                onClick={() => setActiveMediaIdx(idx)}
                                className={`h-2 w-2 rounded-full transition ${
                                  activeMediaIdx === idx ? "bg-[#2F8D59]" : "bg-[#2F8D59]/40"
                                }`}
                                aria-label={`Go to image ${idx + 1}`}
                                title={img.alt || `Image ${idx + 1}`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#4c5f68]">
                      No image available
                    </div>
                  )}
                </div>
                <div className="flex flex-col h-full min-h-0 justify-center">
                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#2F8D59] font-semibold">
                      Health Package
                    </p>
                    <h1 className="text-3xl md:text-4xl font-semibold text-[#10231a]">
                      {pkg?.name || "Health Package"}
                    </h1>
                    {benefit && (
                      <div className={`relative space-y-2 ${!expanded ? "pb-6" : ""}`}>
                        <p
                          ref={descRef}
                          className={`relative text-base text-[#4c5f68] leading-relaxed ${
                            expanded ? "" : "line-clamp-3 pr-16"
                          }`}
                        >
                          {benefit}
                          {!expanded && canToggleDesc && (
                            <span
                              onClick={() => setExpanded(true)}
                              className="ml-1 cursor-pointer text-sm text-[#2F8D59] font-medium align-baseline"
                            >
                              … See more
                            </span>
                          )}
                        </p>
                        {!expanded && canToggleDesc && (
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white via-white/80 to-transparent rounded-b-md" />
                        )}
                        {expanded && canToggleDesc && (
                          <button
                            type="button"
                            onClick={() => setExpanded(false)}
                            aria-expanded={expanded}
                            className="text-sm text-[#2F8D59] hover:underline"
                          >
                            See less
                          </button>
                        )}
                      </div>
                    )}
                    {durationLabel && (
                      <div className="text-sm text-[#10231a] flex items-center gap-2">
                        <span className="font-semibold">Program duration:</span>
                        <span className="px-3 py-1 rounded-full bg-[#e6f2ea] border border-[#cfe8d6] text-[#2F8D59] font-semibold">
                          {durationLabel} days
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 space-y-0.5">
                    <p className="text-sm text-[#4c5f68]">Starting at</p>
                    <p className="text-3xl font-semibold text-[#10231a]">{priceLabel}</p>
                  </div>
                  <button
                    onClick={() => setOpen(true)}
                    className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-[#2F8D59] text-white text-sm font-semibold hover:bg-[#27784c] transition w-full sm:w-auto mt-4"
                  >
                    Book this package
                  </button>
                </div>
              </div>
            </div>

            {pkg?.longDescription && (
              <div className="bg-white border border-[#dfe8e2] rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-semibold text-[#10231a] mb-3">Overview</h2>
                <div
                  className="prose prose-green max-w-none text-[#10231a]"
                  dangerouslySetInnerHTML={{ __html: pkg.longDescription }}
                />
              </div>
            )}

            {pkg?.included?.length > 0 && (
              <div className="bg-white border border-[#dfe8e2] rounded-2xl p-6 md:p-8 space-y-3">
                <h3 className="text-xl font-semibold text-[#10231a]">What&apos;s included</h3>
                <div className="space-y-2">
                  {(pkg.included || [])
                    .flatMap((item) =>
                      typeof item === "string"
                        ? item.split(/[,\n]+/)
                        : Array.isArray(item)
                        ? item
                        : [item]
                    )
                    .map((item) => (item || "").toString().trim())
                    .filter(Boolean)
                    .map((item, idx) => (
                      <div key={`${item}-${idx}`} className="flex items-start gap-2 text-sm text-[#2F8D59]">
                        <span className="mt-0.5">✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {pkg?.galleryImages?.length ? (
              <div className="bg-white border border-[#dfe8e2] rounded-2xl p-6 md:p-8 space-y-4">
                <h3 className="text-xl font-semibold text-[#10231a]">Program gallery</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {pkg.galleryImages.map((img, idx) => (
                    <div
                      key={`${img}-${idx}`}
                      className="relative rounded-xl overflow-hidden border border-[#dfe8e2] bg-[#e6f2ea] aspect-[4/3]"
                    >
                      {img ? (
                        <img src={img} alt={`Gallery ${idx + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {promoVideos.length ? (
              <div className="bg-white border border-[#dfe8e2] rounded-2xl p-6 shadow-sm space-y-3">
                <h3 className="text-xl font-semibold text-[#10231a]">Program videos</h3>
                <div className="space-y-3">
                  {promoVideos.map((vid, idx) => renderVideo(vid, idx))}
                </div>
              </div>
            ) : null}

            {(bestFor || pkg?.experience || pkg?.reasons) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-[#dfe8e2] rounded-2xl p-6 space-y-2">
                  <h3 className="text-lg font-semibold text-[#10231a]">Who this package is for</h3>
                  <p className="text-sm text-[#4c5f68]">
                    {bestFor || "Individuals seeking holistic recovery and preventive care."}
                  </p>
                </div>
                <div className="bg-white border border-[#dfe8e2] rounded-2xl p-6 space-y-2">
                  <h3 className="text-lg font-semibold text-[#10231a]">What you&apos;ll experience</h3>
                  <p className="text-sm text-[#4c5f68]">
                    {pkg?.experience ||
                      "Daily therapies, guided nutrition, mindful movement, and personalized support from our care team."}
                  </p>
                </div>
                <div className="bg-white border border-[#dfe8e2] rounded-2xl p-6 space-y-2 md:col-span-2">
                  <h3 className="text-lg font-semibold text-[#10231a]">Why patients choose this package</h3>
                  <p className="text-sm text-[#4c5f68]">
                    {pkg?.reasons ||
                      "Trusted clinicians, evidence-informed therapies, and a calm environment dedicated to your healing goals."}
                  </p>
                </div>
              </div>
            )}

            <div className="bg-white border border-[#dfe8e2] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-[#10231a]">Ready to start?</p>
                <p className="text-sm text-[#4c5f68]">Book an appointment or contact us for a tailored plan.</p>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/appointments"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#2F8D59] text-white text-sm font-semibold hover:bg-[#27784c] transition"
                >
                  Book Appointment
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-[#2F8D59] text-[#2F8D59] text-sm font-semibold hover:bg-[#e6f2ea] transition"
                >
                  Contact Us
                </Link>
              </div>
            </div>
            </div>

          <div className="space-y-4 lg:sticky lg:top-4">
            {others.length > 0 && (
              <div className="bg-white border border-[#dfe8e2] rounded-2xl p-4 space-y-3">
                <p className="text-sm font-semibold text-[#10231a]">Other packages you may like</p>
                  <div className="space-y-6">
                  {others.map((other) => {
                    const duration = other.duration || other.durationDays || other.days;
                    const price = other.price && Number(other.price) > 0 ? `$${other.price}` : "Contact";
                    const coverImg = other.imageUrl || other.images?.[0] || "";
                    const slugTarget = `/packages/${other.slug || other._id}`;
                    return (
                      <Link
                        key={other._id}
                        href={slugTarget}
                        className="block relative rounded-2xl overflow-hidden border border-green-100 shadow-sm hover:shadow-md hover:shadow-[#2F8D59]/15 transition"
                      >
                        <div className="relative aspect-[4/3]">
                          {coverImg ? (
                            <img
                              src={coverImg}
                              alt={other.name || "Package"}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 w-full h-full bg-[#e6f2ea]" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                          {duration ? (
                            <span className="absolute top-3 right-3 inline-flex px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium shadow-sm">
                              {duration} days
                            </span>
                          ) : null}
                          <div className="absolute inset-0 flex flex-col justify-end p-3 space-y-2">
                            <p className="text-base font-semibold text-white line-clamp-2">
                              {other.name}
                            </p>
                            <span className="text-white text-base font-normal">Starting at: {price}</span>
                            <span className="inline-flex justify-center items-center w-full px-3 py-2 rounded-full bg-[#2F8D59] text-white text-xs font-semibold hover:bg-[#27784c] transition">
                              Book Package
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
      {open && <PackageBookingModal pkg={pkg} onClose={() => setOpen(false)} />}
    </div>
  );
}
