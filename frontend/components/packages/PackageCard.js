"use client";

import Link from "next/link";

function Highlight({ text, term }) {
  if (!term) return text;
  const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")})`, "i");
  const parts = (text || "").split(regex);
  return parts.map((part, idx) =>
    regex.test(part) ? (
      <mark key={idx} className="bg-yellow-100 text-inherit">
        {part}
      </mark>
    ) : (
      <span key={idx}>{part}</span>
    )
  );
}

export default function PackageCard({ pkg, ctaLabel = "View Details", highlightTerm }) {
  const priceLabel =
    pkg?.price && Number(pkg.price) > 0 ? `$${pkg.price}` : "Contact for pricing";
  const tagline = pkg?.shortDescription || pkg?.tagline;
  const idealFor = pkg?.idealFor || pkg?.focus || pkg?.category;
  const duration = pkg?.duration || pkg?.durationDays || pkg?.days;
  const cover = pkg?.imageUrl || (pkg?.images?.[0] ?? "");
  const departmentName =
    pkg?.department?.name ||
    pkg?.departments?.[0]?.name ||
    pkg?.departments?.[0];
  const treatment = pkg?.treatmentType?.name || pkg?.treatmentType;

  return (
    <div className="group bg-white border border-[#dfe8e2] rounded-2xl p-5 shadow-sm hover:shadow-lg hover:shadow-[#2F8D59]/10 transition flex flex-col gap-4 h-full">
      {(cover || duration) && (
        <div className="relative overflow-hidden rounded-xl bg-[#e8f0ea]">
          {cover ? (
            <img
              src={cover}
              alt={pkg?.name || "Health package"}
              className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              loading="lazy"
            />
          ) : (
            <div className="h-40 w-full" />
          )}
          {duration && (
            <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/90 border border-[#cfe8d6] text-[#2F8D59] text-xs font-semibold shadow-sm backdrop-blur">
              {duration}
            </span>
          )}
        </div>
      )}

      <div className="space-y-2 flex-1">
        <h3 className="text-lg font-semibold text-[#10231a] line-clamp-1">
          <Highlight text={pkg?.name || "Health Package"} term={highlightTerm} />
        </h3>
        {departmentName && (
          <p className="text-sm text-[#2F8D59] font-semibold">
            <Highlight text={departmentName} term={highlightTerm} />
          </p>
        )}
        {treatment && (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#e6f2ea] border border-[#cfe8d6] text-xs font-semibold text-[#2F8D59]">
            {treatment}
          </span>
        )}
        {tagline && (
          <p className="text-sm text-[#4c5f68] line-clamp-2">
            <Highlight text={tagline} term={highlightTerm} />
          </p>
        )}
        <div className="flex flex-wrap gap-2 text-xs text-[#2F8D59] font-semibold">
          {duration && (
            <span className="px-3 py-1 rounded-full bg-[#e6f2ea] border border-[#cfe8d6]">
              {duration}
            </span>
          )}
          {idealFor && (
            <span className="px-3 py-1 rounded-full bg-[#e6f2ea] border border-[#cfe8d6]">
              Ideal for {idealFor}
            </span>
          )}
        </div>
        <p className="text-sm font-semibold text-[#10231a]">{priceLabel}</p>
      </div>

      <Link
        href={`/packages/${pkg?.slug || pkg?._id}`}
        className="inline-flex justify-center items-center rounded-full bg-[#2F8D59] text-white text-sm font-semibold px-4 py-2 hover:bg-[#27784c] transition"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
