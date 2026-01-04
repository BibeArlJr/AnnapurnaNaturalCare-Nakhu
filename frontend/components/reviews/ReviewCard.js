"use client";

import Image from "next/image";
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

export default function ReviewCard({ review, highlightTerm }) {
  const rawContent = review?.fullReviewHtml || review?.fullReview || "";
  const plainText =
    typeof rawContent === "string"
      ? rawContent.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
      : "";
  const maxChars = 200;
  const preview =
    plainText.length > maxChars
      ? `${plainText.slice(0, maxChars).trimEnd()}...`
      : plainText;

  const content = (
    <div className="p-5 flex flex-col gap-3 flex-1">
      <div className="flex items-center gap-2">
        <div className="text-sm font-semibold text-slate-900">{review?.patientName || "Anonymous"}</div>
        {review?.country ? (
          <span className="text-xs text-slate-500">
            · <Highlight text={review.country} term={highlightTerm} />
          </span>
        ) : null}
      </div>
      <h3
        className="text-base font-semibold text-slate-900 leading-snug"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        <Highlight text={review?.headline || "Patient review"} term={highlightTerm} />
      </h3>
      <div className="flex items-center gap-1 text-amber-500 text-xs">
        {"★★★★★".slice(0, Math.max(0, Math.min(5, Number(review?.rating) || 0)))}
        <span className="text-xs text-slate-500 ml-1">{review?.rating ? `${review.rating}/5` : ""}</span>
      </div>
      <p
        className="text-sm text-slate-700 leading-relaxed"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          minHeight: "60px",
        }}
      >
        <Highlight text={preview} term={highlightTerm} />
      </p>
      {review?.slug ? (
        <Link href={`/patient-reviews/${review.slug}`} className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
          Read full story →
        </Link>
      ) : null}
    </div>
  );

  const CardInner = (
    <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden flex flex-col h-full transition hover:shadow-lg">
      {review?.coverImage || review?.photo ? (
        <div className="relative h-44 w-full">
          <Image
            src={review.coverImage || review.photo}
            alt={review.patientName || "Patient review"}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="h-3 w-full bg-gradient-to-r from-emerald-100 via-white to-emerald-50" />
      )}
      {content}
    </div>
  );

  return review?.slug ? (
    <Link href={`/patient-reviews/${review.slug}`} className="block h-full">
      {CardInner}
    </Link>
  ) : (
    CardInner
  );
}
