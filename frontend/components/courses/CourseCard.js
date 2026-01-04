"use client";

import Link from "next/link";

export default function CourseCard({ course }) {
  if (!course) return null;
  return (
    <Link
      href={`/courses/${course.slug || course._id}`}
      className="group rounded-2xl border border-[#dfe8e2] bg-white shadow-sm hover:shadow-lg transition overflow-hidden flex flex-col"
    >
      <div className="relative aspect-[4/3] bg-[#e6f2ea]">
        <img
          src={course.coverImage || course.imageUrl || "/images/hero-placeholder.jpg"}
          alt={course.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700"
        />
      </div>
      <div className="p-4 space-y-2 flex-1 flex flex-col">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.14em] text-[#2F8D59] font-semibold">
            {course.category?.name || course.categoryName || "Course"}
          </p>
          {course.duration ? <span className="text-xs text-[#4c5f68]">{course.duration} days</span> : null}
        </div>
        <h3 className="text-lg font-semibold text-[#0f1f17] line-clamp-2">{course.title}</h3>
        <p className="text-sm text-[#4c5f68] line-clamp-3">
          {(course.description || course.overview || course.shortDescription || "").replace(/<[^>]+>/g, "")}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-base font-semibold text-[#0f1f17]">
            {course.price ? `$${course.price}` : "Contact"}
          </span>
          <span className="text-sm text-[#2F8D59] font-semibold">View details →</span>
        </div>
      </div>
    </Link>
  );
}
