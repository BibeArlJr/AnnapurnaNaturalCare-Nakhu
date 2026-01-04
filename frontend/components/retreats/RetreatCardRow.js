"use client";

import Link from "next/link";

export default function RetreatCardRow({ program, onBook }) {
  const cover = program.coverImage || program.galleryImages?.[0] || "";
  const priceLabel = program.pricePerPersonUSD ? `$${program.pricePerPersonUSD} / person` : "Contact for pricing";
  const typeLabel = program.programType === "inside_valley" ? "Inside Valley" : "Outside Valley";
  const destinations = (program.destinations || []).map((d) => (typeof d === "string" ? d : d?.name)).filter(Boolean);

  const included = Array.isArray(program.included)
    ? program.included
    : typeof program.included === "string"
    ? program.included.split(/[,\\n]+/).map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="bg-white border border-[#dfe8e2] rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-lg hover:shadow-[#2F8D59]/10 transition flex flex-col md:flex-row gap-4 md:gap-6">
      <div className="w-full md:w-56 h-40 md:h-44 overflow-hidden rounded-xl bg-[#e8f0ea] flex-shrink-0">
        {cover ? <img src={cover} alt={program.title} className="w-full h-full object-cover" loading="lazy" /> : null}
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-xl font-semibold text-[#10231a]">{program.title}</h3>
          <span className="px-2 py-1 rounded-full bg-[#e6f2ea] text-[#2F8D59] text-xs font-semibold border border-[#cfe8d6]">
            {typeLabel}
          </span>
        </div>
        {program.descriptionShort ? (
          <p className="text-sm text-[#4c5f68] leading-relaxed line-clamp-3">{program.descriptionShort}</p>
        ) : null}
        {(destinations.length || included.length) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {destinations.length ? (
              <div>
                <p className="text-sm font-semibold text-[#10231a] mb-1">Retreat places</p>
                <ul className="space-y-1 text-sm text-[#4c5f68] list-disc list-inside">
                  {destinations.map((d, idx) => (
                    <li key={`${d}-${idx}`}>{d}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {included.length ? (
              <div>
                <p className="text-sm font-semibold text-[#10231a] mb-1">Included services</p>
                <ul className="space-y-1 text-sm text-[#4c5f68] list-disc list-inside">
                  {included.slice(0, 6).map((inc, idx) => (
                    <li key={`${inc}-${idx}`}>{inc}</li>
                  ))}
                  {included.length > 6 ? <li>+{included.length - 6} more</li> : null}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="flex flex-col items-start md:items-end justify-between gap-3 md:w-60 w-full">
        <div className="text-left md:text-right">
          <p className="text-sm text-[#4c5f68]">Starting at</p>
          <p className="text-lg font-semibold text-[#10231a]">{priceLabel}</p>
          {program.durationDays ? (
            <p className="text-xs text-[#4c5f68] mt-2">
              Program duration: <span className="font-semibold text-[#10231a]">{program.durationDays} days</span>
            </p>
          ) : null}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full items-stretch">
          {onBook ? (
            <button
              onClick={() => onBook?.(program)}
              className="inline-flex justify-center items-center whitespace-nowrap rounded-full bg-[#2F8D59] text-white text-sm font-semibold px-4 py-2 hover:bg-[#27784c] transition w-full sm:flex-1 min-w-0"
              type="button"
            >
              Book retreat
            </button>
          ) : null}
          <Link
            href={`/retreat-programs/${program.slug || program._id}`}
            className="inline-flex justify-center items-center whitespace-nowrap rounded-full border border-[#2F8D59] text-[#2F8D59] text-sm font-semibold px-4 py-2 hover:bg-[#e6f2ea] transition w-full sm:flex-1 min-w-0 text-center"
          >
            View details
          </Link>
        </div>
      </div>
    </div>
  );
}
