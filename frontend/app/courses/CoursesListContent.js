"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiGet } from "@/lib/api";

export default function CoursesListContent({ initialCategorySlug = "" }) {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState(initialCategorySlug || "");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingPath = "/courses";

  useEffect(() => {
    const urlCat = searchParams?.get("category") || "";
    setActiveCat(urlCat || initialCategorySlug || "");
  }, [searchParams, initialCategorySlug]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [courseRes, catRes] = await Promise.all([apiGet("/courses"), apiGet("/course-categories/active")]);
        const data = courseRes?.data || courseRes || [];
        const published = data.filter((c) => c.isPublished);
        setCourses(published);
        const cats = (catRes?.data || catRes || [])
          .map((c) => ({ id: c._id || c.id, name: c.name, slug: c.slug }))
          .filter((c) => c.name && c.slug);
        setCategories(cats);
      } catch (err) {
        console.error("Courses load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [initialCategorySlug]);

  const filtered = useMemo(() => {
    if (!activeCat) return courses;
    const catMatch = categories.find((c) => c.slug === activeCat);
    const catId = catMatch?.id;
    return courses.filter((c) => {
      const slugMatch =
        (c.category?.slug || c.categorySlug) === activeCat ||
        (c.category?.name || c.categoryName || c.category) === activeCat;
      const idMatch = catId && (c.category?._id === catId || c.categoryId === catId || c.category === catId);
      return slugMatch || idMatch;
    });
  }, [courses, activeCat, categories]);

  const selectCategory = (slug) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    const query = params.toString();
    router.push(`${listingPath}${query ? `?${query}` : ""}`);
  };

  const headingCat = activeCat ? categories.find((c) => c.slug === activeCat)?.name : null;

  return (
    <div className="bg-[#f5f8f4] min-h-screen">
      <div className="w-full max-w-6xl xl:max-w-6xl 2xl:max-w-[1200px] mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="flex flex-col gap-3">
          <p className="text-sm uppercase tracking-[0.2em] text-[#2F8D59] font-semibold">Courses</p>
          <h1 className="text-3xl md:text-4xl font-semibold text-[#0f1f17]">
            {headingCat ? `${headingCat} Courses` : "Learn with Annapurna"}
          </h1>
          <p className="text-[#4c5f68] max-w-3xl">Yoga teacher training, online and residential programs, and sound healing courses.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => selectCategory("")}
            className={`px-3 py-1.5 rounded-full border ${!activeCat ? "bg-[#2F8D59] text-white border-[#2F8D59]" : "border-[#dfe8e2] text-[#0f1f17]"}`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => selectCategory(cat.slug)}
              className={`px-3 py-1.5 rounded-full border ${
                activeCat === cat.slug ? "bg-[#2F8D59] text-white border-[#2F8D59]" : "border-[#dfe8e2] text-[#0f1f17]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-64 rounded-2xl bg-white border border-[#dfe8e2]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-[#dfe8e2] bg-white shadow-sm p-6 text-[#0f1f17] space-y-3">
                <h3 className="text-lg font-semibold">No courses in this category yet</h3>
                <p className="text-sm text-[#4c5f68]">
                  Course in this category is not available right now. Please try a different category or browse all courses.
                </p>
                <Link
                  href="/courses"
                  className="inline-flex w-fit px-4 py-2 rounded-full bg-[#2F8D59] text-white text-sm font-semibold shadow-sm"
                >
                  Browse all courses
                </Link>
              </div>
            ) : (
              filtered.map((course) => (
                <Link
                  key={course.slug || course._id}
                  href={`/courses/${course.slug || course._id}`}
                  className="group rounded-2xl border border-[#dfe8e2] bg-white shadow-sm hover:shadow-lg transition overflow-hidden flex flex-col"
                >
                  <div className="relative aspect-[4/3] bg-[#e6f2ea]">
                    <img
                      src={course.coverImage || course.imageUrl || "/images/hero-placeholder.jpg"}
                      alt={course.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 space-y-2 flex-1 flex flex-col">
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-[0.14em] text-[#2F8D59] font-semibold">{course.category?.name || course.categoryName || "Course"}</p>
                      {course.duration ? <span className="text-xs text-[#4c5f68]">{course.duration} days</span> : null}
                    </div>
                    <h3 className="text-lg font-semibold text-[#0f1f17] line-clamp-2">{course.title}</h3>
                    <p className="text-sm text-[#4c5f68] line-clamp-3">
                      {(course.description || course.shortDescription || "").replace(/<[^>]+>/g, "")}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <span className="text-base font-semibold text-[#0f1f17]">
                        {course.price ? `$${course.price}` : "Contact"}
                      </span>
                      <span className="text-sm text-[#2F8D59] font-semibold">View details →</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
