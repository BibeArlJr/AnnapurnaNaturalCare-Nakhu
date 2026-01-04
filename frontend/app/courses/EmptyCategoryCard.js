"use client";

import Link from "next/link";

export default function EmptyCategoryCard() {
  return (
    <div className="rounded-2xl border border-[#dfe8e2] bg-white shadow-sm p-6 flex flex-col items-start gap-3">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-[#e6f2ea] text-[#2F8D59] flex items-center justify-center text-lg">🗂️</div>
        <h3 className="text-lg font-semibold text-[#0f1f17]">No courses in this category yet</h3>
      </div>
      <p className="text-sm text-[#4c5f68]">
        We&apos;re still adding courses here. Try a different category or browse all courses.
      </p>
      <Link
        href="/courses"
        className="inline-flex px-4 py-2 rounded-full bg-[#2F8D59] text-white font-semibold hover:bg-[#27784c] transition"
      >
        Browse all courses
      </Link>
    </div>
  );
}
