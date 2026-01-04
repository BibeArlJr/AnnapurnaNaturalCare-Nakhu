'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

export default function DoctorHeroCarousel({ doc, specialty, galleryImages = [] }) {
  const images = Array.isArray(galleryImages) ? galleryImages.filter(Boolean) : [];
  const [active, setActive] = useState(0);

  const slides = useMemo(() => {
    const list = [
      {
        key: 'cards',
        content: (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="bg-white/90 text-neutral-900 rounded-xl border border-white/70 shadow-md p-5 h-full">
              <h3 className="text-lg font-semibold text-neutral-800 mb-3">Doctor Details</h3>
              <ul className="space-y-2 text-neutral-700 text-sm">
                <li>
                  <strong>Specialty:</strong> {specialty}
                </li>
                {doc.degree ? (
                  <li>
                    <strong>Degree:</strong> {doc.degree}
                  </li>
                ) : null}
                {doc.experienceYears ? (
                  <li>
                    <strong>Experience:</strong> {doc.experienceYears} years
                  </li>
                ) : null}
                {doc.department?.name ? (
                  <li>
                    <strong>Department:</strong> {doc.department.name}
                  </li>
                ) : null}
              </ul>
            </div>
            <div className="bg-white/90 text-neutral-900 rounded-xl border border-white/70 shadow-md p-5 h-full">
              <h3 className="text-lg font-semibold text-neutral-800 mb-3">Book an Appointment</h3>
              <p className="text-neutral-700 text-sm mb-4">Choose a date and time to book with {doc.name}.</p>
              <div className="flex justify-center">
                <Link
                  href={`/appointments?doctor=${doc.slug}`}
                  className="inline-block text-center bg-primary-teal hover:bg-primary-dark text-white font-semibold px-4 py-2 rounded-lg transition"
                >
                  View Availability
                </Link>
              </div>
            </div>
          </div>
        ),
      },
      ...images.map((src, idx) => ({
        key: `img-${idx}`,
        content: (
          <div className="w-full h-full rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 min-h-[220px] flex items-center justify-center">
            <img src={src} alt={`${doc.name} ${idx + 1}`} className="w-full h-full object-cover" />
          </div>
        ),
      })),
    ];
    return list;
  }, [doc.degree, doc.department?.name, doc.experienceYears, doc.name, doc.slug, images, specialty]);

  useEffect(() => {
    if (active >= slides.length) {
      setActive(0);
    }
  }, [active, slides.length]);

  function next() {
    setActive((prev) => (prev + 1) % slides.length);
  }
  function prev() {
    setActive((prev) => (prev - 1 + slides.length) % slides.length);
  }

  if (!slides.length) return null;

  return (
    <div className="relative bg-white/90 text-neutral-900 rounded-xl border border-white/70 shadow-md p-5 h-full flex flex-col">
      <div className="relative min-h-[260px] flex-1">
        {slides.map((slide, idx) => (
          <div
            key={slide.key}
            className={`absolute inset-0 transition-opacity duration-300 ${
              idx === active ? 'opacity-100' : 'opacity-0 pointer-events-none'
            } flex items-center`}
          >
            {slide.content}
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <div className="mt-4 relative">
          <button
            type="button"
            onClick={prev}
            className="h-9 w-9 rounded-full border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-100 shadow-sm absolute left-0 top-1/2 -translate-y-1/2"
            aria-label="Previous slide"
          >
            ←
          </button>
          <button
            type="button"
            onClick={next}
            className="h-9 w-9 rounded-full border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-100 shadow-sm absolute right-0 top-1/2 -translate-y-1/2"
            aria-label="Next slide"
          >
            →
          </button>
          <div className="flex gap-2 justify-center">
            {slides.map((slide, idx) => (
              <button
                key={slide.key}
                type="button"
                onClick={() => setActive(idx)}
                className={`h-2.5 w-2.5 rounded-full transition ${idx === active ? 'bg-emerald-700' : 'bg-emerald-700/30'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
