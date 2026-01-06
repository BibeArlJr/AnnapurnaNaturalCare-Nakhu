"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Container from "@/components/Container";
import Link from "next/link";
import { getApiErrorMessage } from "@/lib/errorMessage";
import RetreatBookingModal from "@/components/retreats/RetreatBookingModal";
import { apiGet } from "@/lib/api";

function IncludedList({ items = [], alwaysPickup }) {
  if (!items.length && !alwaysPickup) return null;
  const merged = alwaysPickup ? ["Airport pickup", ...items] : items;
  return (
    <div className="space-y-3">
      <h3 className="text-xl font-semibold text-[#10231a]">What&apos;s included</h3>
      <div className="space-y-2">
        {merged.map((item, idx) => (
          <div key={`${item}-${idx}`} className="flex items-start gap-3 text-sm text-[#2F8D59]">
            <span className="mt-0.5">✓</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RetreatProgramDetailPage({ params }) {
  const { slug } = params || {};
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otherPrograms, setOtherPrograms] = useState([]);
  const [activeMediaIdx, setActiveMediaIdx] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);
  const [canToggleDesc, setCanToggleDesc] = useState(false);
  const descRef = useRef(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    async function load() {
      if (!slug) return;
      setLoading(true);
      try {
        const [detailRes, listRes] = await Promise.all([apiGet(`/retreat-programs/${slug}`), apiGet("/retreat-programs")]);

        const item = detailRes?.data || detailRes;
        const allPrograms = listRes?.data || listRes || [];
        const filtered =
          item && item._id
            ? allPrograms.filter((p) => p._id !== item._id && p.slug !== item.slug)
            : allPrograms;

        setOtherPrograms(filtered.slice(0, 6));
        if (item && item.slug) {
          setProgram(item);
        } else {
          setProgram(null);
        }
      } catch (err) {
        console.error("Retreat program load error:", err);
        setProgram(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const durationLabel = program?.durationDays ? `${program.durationDays} days` : null;
  const priceLabel = program?.pricePerPersonUSD ? `$${program.pricePerPersonUSD} per person` : "Contact for pricing";
  const programTypeLabel =
    program?.programType === "inside_valley" ? "Inside Valley" : program?.programType === "outside_valley" ? "Outside Valley" : null;

  const destinationLabels = useMemo(() => {
    return (program?.destinations || [])
      .map((d) => (typeof d === "string" ? d : d?.name))
      .filter(Boolean);
  }, [program?.destinations]);

  const mediaImages = useMemo(() => {
    if (!program) return [];
    const imgs = [];
    if (program.coverImage) imgs.push({ src: program.coverImage, alt: program.title });
    (program.galleryImages || []).forEach((img, idx) => {
      if (img) imgs.push({ src: img, alt: `${program.title} ${idx + 1}` });
    });
    return imgs;
  }, [program]);

  useEffect(() => {
    setActiveMediaIdx(0);
  }, [program?._id, mediaImages.length]);

  useEffect(() => {
    const el = descRef.current;
    if (!el || !program?.descriptionShort) {
      setCanToggleDesc(false);
      setDescExpanded(false);
      return;
    }
    el.classList.add("line-clamp-3");
    const needsClamp = el.scrollHeight > el.clientHeight + 1;
    setCanToggleDesc(needsClamp);
    if (descExpanded) {
      el.classList.remove("line-clamp-3");
    }
  }, [program?.descriptionShort, descExpanded]);

  if (loading) {
    return (
      <div className="bg-[#f5f8f4] min-h-screen">
        <Container className="py-16">
          <p className="text-sm text-[#4c5f68]">Loading program...</p>
        </Container>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="bg-[#f5f8f4] min-h-screen">
        <Container className="py-16 space-y-4">
          <h1 className="text-3xl font-semibold text-[#10231a]">Retreat not found</h1>
          <Link href="/retreat-programs" className="text-[#2F8D59] font-semibold hover:underline">
            Back to Retreat Programs
          </Link>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f8f4] min-h-screen">
      <Container className="py-14 md:py-18">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
          <div className="flex flex-col gap-6">
            <section className="bg-white border border-[#dfe8e2] rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="grid md:grid-cols-2 gap-6 items-stretch">
                <div className="w-full rounded-2xl overflow-hidden bg-[#e6f2ea] relative aspect-[4/3] min-h-[260px]">
                  {mediaImages.length ? (
                    <>
                      <img
                        src={mediaImages[activeMediaIdx]?.src}
                        alt={mediaImages[activeMediaIdx]?.alt || program.title}
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
                <div className="flex flex-col h-full min-h-0 justify-center gap-4">
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#2F8D59] font-semibold">
                    Retreat Program
                  </p>
                  <h1 className="text-3xl md:text-4xl font-semibold text-[#10231a]">
                      {program.title}
                    </h1>
                    {programTypeLabel && (
                      <p className="text-sm text-[#10231a]">
                        <span className="font-semibold">Program type:</span> {programTypeLabel}
                      </p>
                    )}
                    {durationLabel && (
                      <p className="text-sm text-[#10231a]">
                        <span className="font-semibold">Program duration:</span> {durationLabel}
                      </p>
                    )}
                    {program.descriptionShort ? (
                      <div className={`relative space-y-2 ${!descExpanded ? "pb-4" : ""}`}>
                        <p
                          ref={descRef}
                          className={`text-base text-[#4c5f68] leading-relaxed ${
                            descExpanded ? "" : "line-clamp-3 pr-16"
                          }`}
                        >
                          {program.descriptionShort}
                          {!descExpanded && canToggleDesc && (
                            <span
                              onClick={() => setDescExpanded(true)}
                              className="ml-1 cursor-pointer text-sm text-[#2F8D59] font-medium align-baseline"
                            >
                              … See more
                            </span>
                          )}
                        </p>
                        {!descExpanded && canToggleDesc && (
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white via-white/80 to-transparent rounded-b-md" />
                        )}
                        {descExpanded && canToggleDesc && (
                          <button
                            type="button"
                            onClick={() => setDescExpanded(false)}
                            aria-expanded={descExpanded}
                            className="text-sm text-[#2F8D59] hover:underline"
                          >
                            See less
                          </button>
                        )}
                      </div>
                    ) : null}
                  <div className="space-y-1">
                    <p className="text-sm text-[#4c5f68]">Starting at</p>
                    <p className="text-3xl font-semibold text-[#10231a]">{priceLabel}</p>
                  </div>
                  {program.accommodationPricing?.length ? (
                    <div className="space-y-1">
                      <p className="text-sm text-[#4c5f68] font-semibold">Accommodation pricing (per person)</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {program.accommodationPricing.map((p) => (
                          <div
                            key={p.key}
                            className="rounded-lg border border-[#e6f0eb] bg-[#f5f8f4] px-3 py-2 text-sm text-[#10231a]"
                          >
                            <p className="font-semibold">{p.label || p.key}</p>
                            <p className="text-[#2F8D59]">
                              {p.pricePerPersonUSD ? `$${p.pricePerPersonUSD} / person` : "$0 / person"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
                <button
                  onClick={() => setBookingOpen(true)}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-[#2F8D59] text-white text-sm font-semibold hover:bg-[#27784c] transition w-full sm:w-auto"
                >
                    Book Retreat
                  </button>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-[#dfe8e2] rounded-2xl p-6 space-y-3">
                <h3 className="text-lg font-semibold text-[#10231a]">Our Retreat Places</h3>
                <div className="space-y-2">
                  {destinationLabels.length ? (
                    destinationLabels.map((label) => (
                      <div key={label} className="flex items-start gap-2 text-sm text-[#10231a]">
                        <span className="text-[#2F8D59] mt-0.5">•</span>
                        <span>{label}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[#4c5f68]">Destinations to be announced.</p>
                  )}
                </div>
              </div>

              <div className="bg-white border border-[#dfe8e2] rounded-2xl p-5 space-y-3">
                <h3 className="text-lg font-semibold text-[#10231a]">What&apos;s included</h3>
                <div className="space-y-1.5">
                  {[
                    ...(program.alwaysIncludesAirportPickup ? ["Airport pickup"] : []),
                    ...(program.included || []),
                  ]
                    .filter((item) => item && item.toString().trim())
                    .map((item, idx) => (
                      <div key={`${item}-${idx}`} className="flex items-start gap-2 text-sm text-[#2F8D59]">
                        <span className="mt-0.5">✓</span>
                        <span className="text-[#10231a]">{item}</span>
                      </div>
                    ))}
                  {(!program.included || program.included.length === 0) && !program.alwaysIncludesAirportPickup ? (
                    <p className="text-sm text-[#4c5f68]">Details coming soon.</p>
                  ) : null}
                </div>
              </div>
            </section>

            {program.descriptionLong ? (
              <section className="bg-white border border-[#dfe8e2] rounded-2xl p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-semibold text-[#10231a] mb-3">Program overview</h2>
                <div
                  className="prose prose-green max-w-none text-[#10231a]"
                  dangerouslySetInnerHTML={{ __html: program.descriptionLong }}
                />
              </section>
            ) : null}

            {program.promoVideo ? (
              <section className="bg-white border border-[#dfe8e2] rounded-2xl p-6 shadow-sm space-y-3">
                <h3 className="text-xl font-semibold text-[#10231a]">Program video</h3>
                <div className="w-full rounded-xl overflow-hidden border border-[#e6f0eb] bg-black">
                  <video src={program.promoVideo} controls className="w-full h-full" />
                </div>
              </section>
            ) : null}

            <section className="bg-white border border-[#dfe8e2] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
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
            </section>
          </div>

          <aside className="lg:sticky lg:top-4">
            <div className="bg-white border border-[#dfe8e2] rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-lg font-semibold text-[#10231a]">Other Retreat Programs</h3>
              {otherPrograms.length === 0 ? (
                <p className="text-sm text-[#4c5f68]">More retreats coming soon.</p>
              ) : (
                <div className="space-y-4">
                  {otherPrograms.slice(0, 6).map((item) => {
                    const itemType =
                      item.programType === "inside_valley"
                        ? "Inside Valley"
                        : item.programType === "outside_valley"
                        ? "Outside Valley"
                        : "Retreat";
                    const itemDuration = item.durationDays ? `${item.durationDays} days` : null;
                    const price = item.pricePerPersonUSD ? `$${item.pricePerPersonUSD}` : "Contact";
                    return (
                      <Link
                        key={item._id}
                        href={`/retreat-programs/${item.slug || item._id}`}
                        className="block rounded-2xl border border-[#e6f0eb] overflow-hidden shadow-sm hover:shadow-md hover:shadow-[#2F8D59]/10 transition"
                      >
                        <div className="relative aspect-[4/3] bg-[#e6f2ea]">
                          {item.coverImage ? (
                            <img
                              src={item.coverImage}
                              alt={item.title}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          ) : null}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />
                          {itemDuration ? (
                            <span className="absolute top-2 right-2 inline-flex px-2 py-1 rounded-full bg-white/90 text-[#10231a] text-xs font-semibold">
                              {itemDuration}
                            </span>
                          ) : null}
                        </div>
                        <div className="p-4 space-y-2 bg-white">
                          <p className="text-base font-semibold text-[#10231a] line-clamp-2">
                            {item.title}
                          </p>
                          <div className="text-xs text-[#2F8D59] font-semibold">
                            {itemType}
                          </div>
                          <div className="text-sm text-[#4c5f68]">Price: {price}</div>
                          <span className="inline-flex justify-center items-center w-full px-3 py-2 rounded-full bg-[#2F8D59] text-white text-xs font-semibold hover:bg-[#27784c] transition">
                            View program
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>
        </div>
      </Container>
      <RetreatBookingModal
        program={program}
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
      />
    </div>
  );
}
