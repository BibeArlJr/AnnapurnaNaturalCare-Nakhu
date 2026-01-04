"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { apiGet } from "@/lib/api";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import CourseBookingModal from "@/components/courses/CourseBookingModal";

const toEmbedUrl = (url = "") => {
  if (!url) return "";
  if (url.includes("watch?v=")) return url.replace("watch?v=", "embed/");
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

export default function CourseDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const slug = params?.slug;
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activeCat, setActiveCat] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [openBooking, setOpenBooking] = useState(false);

  useEffect(() => {
    if (!slug) return;
    async function load() {
      setLoading(true);
      try {
        const [res, catRes, allRes] = await Promise.all([
          apiGet(`/courses/${slug}`),
          apiGet("/course-categories/active").catch(() => []),
          apiGet("/courses").catch(() => []),
        ]);
        const data = res?.data || res;
        setCourse(data?.isPublished ? data : null);
        const cats = (catRes?.data || catRes || []).map((c) => ({ name: c.name, slug: c.slug })).filter((c) => c.name && c.slug);
        setCategories(cats);
        const published = (allRes?.data || allRes || []).filter((c) => c.isPublished);
        setCourses(published);
        const catQuery = searchParams.get("category") || "";
        setActiveCat(catQuery);
        if (catQuery) {
          const exists = cats.some((c) => c.slug === catQuery);
          setInvalid(!exists);
        }
      } catch (err) {
        console.error("Course load error:", err);
        setCourse(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const gallery = useMemo(() => course?.galleryImages || [], [course?.galleryImages]);
  const promoVideos = useMemo(() => {
    const list = Array.isArray(course?.promoVideos) ? course.promoVideos : [];
    const extra = course?.videoUrl ? [course.videoUrl] : [];
    return [...list, ...extra].map((v) => (typeof v === "string" ? v : v?.url)).filter(Boolean);
  }, [course?.promoVideos, course?.videoUrl]);

  const heroImages = useMemo(() => {
    const imgs = gallery.length ? gallery : [];
    const cover = course?.coverImage || "/images/hero-placeholder.jpg";
    return imgs.length ? imgs : [cover];
  }, [gallery, course?.coverImage]);
  const [heroIdx, setHeroIdx] = useState(0);

  useEffect(() => {
    if (!heroImages.length) return;
    const timer = setInterval(() => {
      setHeroIdx((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  useEffect(() => {
    if (!heroImages.length) return;
    const timer = setInterval(() => {
      setHeroIdx((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const filteredCourses = useMemo(() => {
    if (!activeCat) return courses;
    return courses.filter(
      (c) =>
        (c.category?.slug || c.categorySlug) === activeCat ||
        (c.category?.name || c.categoryName || c.category) === activeCat
    );
  }, [courses, activeCat]);

  const selectCategory = (slug) => {
    setActiveCat(slug);
    const params = new URLSearchParams(searchParams.toString());
    if (slug) params.set("category", slug);
    else params.delete("category");
    window.history.replaceState({}, "", `/courses${params.toString() ? `?${params.toString()}` : ""}`);
  };

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-12 text-[#4c5f68]">Loading...</div>;
  if (!course) {
    return (
      <div className="bg-[#f5f8f4] min-h-screen">
        <div className="w-full max-w-6xl xl:max-w-6xl 2xl:max-w-[1200px] mx-auto px-4 sm:px-6 py-12 space-y-8">
          <div className="flex flex-col gap-3">
            <p className="text-sm uppercase tracking-[0.2em] text-[#2F8D59] font-semibold">Courses</p>
            <h1 className="text-3xl md:text-4xl font-semibold text-[#0f1f17]">Learn with Annapurna</h1>
            <p className="text-[#4c5f68] max-w-3xl">Yoga teacher training, online and residential programs, and sound healing courses.</p>
          </div>
          {categories.length > 0 && (
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
          )}
          <div className="bg-white border border-[#dfe8e2] rounded-2xl p-6 shadow-sm space-y-3">
            {invalid ? (
              <p className="text-[#4c5f68]">No such category found.</p>
            ) : activeCat && filteredCourses.length === 0 ? (
              <p className="text-[#4c5f68]">No courses available in this category yet.</p>
            ) : (
              <p className="text-[#4c5f68]">We couldn’t find this course. It may have been removed or renamed.</p>
            )}
            <Link
              href="/courses"
              className="inline-flex px-4 py-2 rounded-full bg-[#2F8D59] text-white font-semibold hover:bg-[#27784c] transition w-fit"
            >
              Browse all courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f8f4] min-h-screen">
      <div className="relative h-[90vh] min-h-[520px] w-full overflow-hidden">
        <div className="absolute inset-0">
          {heroImages.map((src, idx) => {
            const isActive = idx === heroIdx;
            return (
              <img
                key={`${src}-${idx}`}
                src={src}
                alt={course.title}
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  opacity: isActive ? 1 : 0,
                  transition: "opacity 1.2s ease, transform 8s ease",
                  transform: isActive ? "scale(1.05)" : "scale(1)",
                }}
              />
            );
          })}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        <div className="relative z-10 flex h-full items-center">
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-3xl space-y-4 text-white">
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs tracking-[0.25em] uppercase">
                {course.category?.name || "Course"}
              </span>
              <h1 className="text-4xl sm:text-5xl font-semibold leading-tight">{course.title}</h1>
              {(() => {
                const overview = course.overview || course.description || course.detailedDescription || "";
                const plain = overview.replace(/<[^>]+>/g, " ").trim();
                return plain ? (
                  <p className="text-base sm:text-lg text-white/90 leading-relaxed">
                    {plain}
                  </p>
                ) : null;
              })()}
              <div className="flex flex-wrap gap-3 text-sm text-white/80">
                {course.duration ? <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">{course.duration} days</span> : null}
                {course.mode ? <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 capitalize">{course.mode}</span> : null}
                {course.price ? <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">USD {course.price}</span> : null}
              </div>
              <button
                onClick={() => setOpenBooking(true)}
                className="mt-2 inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#2F8D59] hover:bg-[#27784c] text-white font-semibold shadow-lg transition"
              >
                Enroll now
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-6xl xl:max-w-6xl 2xl:max-w-[1200px] mx-auto px-4 sm:px-6 py-12 space-y-10">
        <div className="space-y-4 relative">
          <div
            className="rounded-2xl border border-[#dfe8e2] bg-white shadow-sm p-5 md:max-w-[360px] md:w-[360px] md:ml-6 md:mb-4"
            style={{ float: "right" }}
          >
            <h3 className="text-lg font-semibold text-[#0f1f17] mb-3">Key details</h3>
            <div className="space-y-2 text-sm text-[#1d3329]">
              {course.duration ? <p>Duration: {course.duration} days</p> : null}
              {course.mode ? <p>Mode: {course.mode}</p> : null}
              {course.price ? <p>Price: USD {course.price}</p> : null}
              {course.certificationInfo ? <p>Certification: {course.certificationInfo}</p> : null}
            </div>
          </div>
          <div className="space-y-4" id="about">
            <h2 className="text-xl font-semibold text-[#0f1f17]">About this course</h2>
            <div
              className="prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: course.detailedDescription || course.description || course.overview || "" }}
            />
          </div>
          <div className="clear-both md:hidden" />
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-[#0f1f17]">Syllabus</h3>
          {course.syllabus?.length ? (
            <div className="space-y-2">
              {course.syllabus.map((topic, idx) => (
                <details key={idx} className="rounded-2xl border border-[#dfe8e2] bg-white shadow-sm">
                  <summary className="cursor-pointer px-4 py-3 font-semibold text-[#0f1f17]">{topic.topic}</summary>
                  <ul className="px-4 pb-3 space-y-2 list-disc list-inside text-sm text-[#1d3329]">
                    {(topic.items || []).map((item, subIdx) => (
                      <li key={subIdx}>{item}</li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#4c5f68]">Syllabus coming soon.</p>
          )}
        </div>

        {promoVideos.length ? (
          <div className="space-y-3" id="videos">
            <h3 className="text-xl font-semibold text-[#0f1f17]">Promo videos</h3>
            <div className="space-y-3">
              {promoVideos.map((vid, idx) =>
                /youtube\.com|youtu\.be|vimeo\.com/.test(vid || "") ? (
                  <iframe
                    key={`${vid}-${idx}`}
                    src={toEmbedUrl(vid)}
                    className="w-full aspect-video rounded-xl border border-[#dfe8e2]"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video key={`${vid}-${idx}`} src={vid} controls className="w-full rounded-xl border border-[#dfe8e2]" />
                )
              )}
            </div>
          </div>
        ) : null}
      </div>
      {openBooking && <CourseBookingModal course={course} open={openBooking} onClose={() => setOpenBooking(false)} />}
    </div>
  );
}
