"use client";

import Link from "next/link";

function normalizeIncluded(raw) {
  const parts = [];
  const addParts = (val) => {
    if (!val) return;
    const str = val.toString();
    // split by comma/newline; if no separators, fall back to whitespace split
    const primary = str.split(/[,\n]+/);
    const base = primary.length > 1 ? primary : str.split(/\s+/);
    base.forEach((item) => {
      if (!item) return;
      const clean = item.toString().trim();
      if (clean) parts.push(clean);
    });
  };

  if (Array.isArray(raw)) {
    raw.forEach(addParts);
  } else if (typeof raw === "string") {
    addParts(raw);
  }
  return parts;
}

const buildChips = (pkg) => {
  const chips = [];
  const includedItems = normalizeIncluded(pkg?.included);
  includedItems.forEach((val) => {
    if (!val) return;
    const clean = val.toString().trim();
    if (!clean) return;
    if (["a", "h", "b", "c", "d", "e"].includes(clean.toLowerCase())) return;
    chips.push(clean);
  });
  if (pkg?.bestFor) chips.push(`Best for ${pkg.bestFor}`);
  return { chips, duration: pkg?.duration || pkg?.durationDays || pkg?.days };
};

export default function PackageCardRow({ pkg, onBook }) {
  const priceLabel =
    pkg?.price && Number(pkg.price) > 0 ? `$${pkg.price}` : "Contact for pricing";
  const tagline = pkg?.shortDescription || pkg?.tagline;
  const benefit = pkg?.benefit || pkg?.benefitLine;
  const bestFor = pkg?.bestFor || pkg?.recommendedFor;
  const cover = pkg?.imageUrl || (pkg?.images?.[0] ?? "");
  const { chips } = buildChips(pkg);
  const durationValue = pkg?.duration || pkg?.durationDays || pkg?.days;
  const departmentName =
    pkg?.department?.name ||
    pkg?.departments?.[0]?.name ||
    pkg?.departments?.[0];
  const treatment = pkg?.treatmentType?.name || pkg?.treatmentType;
  const limitedIncluded = chips.slice(0, 4);
  const remaining = Math.max(0, chips.length - limitedIncluded.length);

  return (
    <div className="bg-white border border-[#dfe8e2] rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-lg hover:shadow-[#2F8D59]/10 transition flex flex-col md:flex-row gap-4 md:gap-6">
      <div className="w-full md:w-56 h-40 md:h-44 overflow-hidden rounded-xl bg-[#e8f0ea] flex-shrink-0">
        {cover ? (
          <img
            src={cover}
            alt={pkg?.name || "Health package"}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : null}
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-xl font-semibold text-[#10231a]">{pkg?.name || "Health Package"}</h3>
          {pkg?.badge && (
            <span className="px-2 py-1 rounded-full bg-[#e6f2ea] text-[#2F8D59] text-xs font-semibold border border-[#cfe8d6]">
              {pkg.badge}
            </span>
          )}
          {treatment && (
            <span className="px-2 py-1 rounded-full bg-[#e6f2ea] text-[#2F8D59] text-xs font-semibold border border-[#cfe8d6]">
              {treatment}
            </span>
          )}
        </div>
        {departmentName && (
          <p className="text-sm font-semibold text-[#2F8D59]">{departmentName}</p>
        )}
        {tagline && (
          <p className="text-sm text-[#4c5f68] leading-relaxed line-clamp-3">{tagline}</p>
        )}
        {bestFor && (
          <p className="text-sm font-semibold text-[#2F8D59]">Recommended for {bestFor}</p>
        )}
        {benefit && (
          <p className="text-sm text-[#10231a] font-medium">{benefit}</p>
        )}
        {limitedIncluded.length > 0 && (
          <div className="space-y-1">
            {limitedIncluded.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm text-[#2F8D59]">
                <span className="mt-0.5">✓</span>
                <span>{item}</span>
              </div>
            ))}
            {remaining > 0 && (
              <p className="text-xs text-[#4c5f68] font-medium">+{remaining} more included</p>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col items-start md:items-end justify-between gap-3 md:w-40">
        <div className="text-left md:text-right">
          <p className="text-sm text-[#4c5f68]">Starting at</p>
          <p className="text-lg font-semibold text-[#10231a]">{priceLabel}</p>
          {durationValue && (
            <div className="mt-3 text-xs text-[#4c5f68] space-y-1">
              <p className="font-semibold text-[#10231a]">Program duration</p>
              <span className="inline-flex px-3 py-1 rounded-full bg-[#e6f2ea] border border-[#cfe8d6] text-[#2F8D59] font-semibold">
                {durationValue} days
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Link
            href={`/packages/${pkg?.slug || pkg?._id}`}
            className="inline-flex justify-center items-center rounded-full bg-[#2F8D59] text-white text-sm font-semibold px-4 py-2 hover:bg-[#27784c] transition w-full md:w-auto whitespace-nowrap"
          >
            View Details
          </Link>
          <button
            type="button"
            onClick={() => onBook?.(pkg)}
            className="inline-flex justify-center items-center rounded-full border border-[#2F8D59] text-[#2F8D59] text-sm font-semibold px-4 py-2 hover:bg-[#e6f2ea] transition w-full md:w-auto whitespace-nowrap"
          >
            Book Package
          </button>
        </div>
      </div>
    </div>
  );
}
