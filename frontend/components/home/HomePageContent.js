"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import DepartmentCard from "@/components/DepartmentCard";

function StatCard({ label, value }) {
  return (
    <div className="p-4 bg-white rounded-xl border border-[#cfe8d6] shadow-sm text-center">
      <p className="text-2xl font-semibold text-[#2F8D59]">{value}</p>
      <p className="text-sm text-[#1b3c32]">{label}</p>
    </div>
  );
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.5,
    delay,
    ease: "easeOut",
  },
});

const sectionWrapper = "py-14";
const sectionContainer = "max-w-7xl mx-auto px-4";

export default function HomePageContent() {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [packages, setPackages] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [retreatPrograms, setRetreatPrograms] = useState([]);
  const [programSlide, setProgramSlide] = useState(0);
  const programScrollRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const onlyPublished = (list = []) => list.filter((item) => (item?.status || "") === "published");

  const stripHtml = (val = "") =>
    typeof val === "string" ? val.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "";

  const storyItems = useMemo(() => {
    const blogCards =
      (blogs || []).map((b) => ({
        type: "blog",
        id: b._id,
        title: b.title || b.name || "Article",
        description: stripHtml(b.shortDescription || b.excerpt || b.description || "").slice(0, 180),
        image: b.coverImage || b.image || b.photo || b.heroImage || null,
        href: `/blog/${b.slug || b._id}`,
        tag: "Blog",
      })) || [];

    const reviewCards =
      (reviews || []).map((r) => ({
        type: "review",
        id: r._id,
        title: r.headline || r.patientName || "Patient review",
        description: stripHtml(r.fullReviewHtml || r.fullReview || r.shortReview || "").slice(0, 180),
        image: r.coverImage || r.photo || null,
        href: `/patient-reviews/${r.slug || r._id}`,
        tag: "Patient review",
        rating: r.rating,
        patientName: r.patientName,
        country: r.country,
      })) || [];

    return [...blogCards, ...reviewCards];
  }, [blogs, reviews]);

  const programItems = useMemo(() => {
    const pkgCards =
      (packages || []).map((pkg) => {
        const programDays = pkg.duration || pkg.durationDays || pkg.days;
        const duration = programDays ? `Program Duration: ${programDays} days` : "";
        const image =
          pkg.imageUrl || pkg.image || pkg.photo || pkg.coverImage || pkg.heroImage || (pkg.galleryImages || [])[0] || null;
        return {
          type: "package",
          id: pkg._id,
          title: pkg.name || pkg.title || "Health package",
          description: stripHtml(pkg.shortDescription || pkg.description || "").slice(0, 180),
          price: pkg.price ? `$${pkg.price}` : "",
          duration,
          image,
          href: `/pack/${pkg.slug || pkg._id}`,
          tag: "Health package",
        };
      }) || [];

    const retreatCards =
      (retreatPrograms || []).map((prog) => {
        const programDays = prog.durationDays;
        const duration = programDays ? `Program Duration: ${programDays} days` : "";
        const image = prog.coverImage || (prog.galleryImages || [])[0] || null;
        const price = prog.pricePerPersonUSD ? `$${prog.pricePerPersonUSD}` : "";
        return {
          type: "retreat",
          id: prog._id,
          title: prog.title || "Retreat program",
          description: stripHtml(prog.descriptionShort || prog.descriptionLong || "").slice(0, 180),
          price,
          duration,
          image,
          href: `/retreat-programs/${prog.slug || prog._id}`,
          tag: "Retreat program",
        };
      }) || [];

    return [...pkgCards, ...retreatCards];
  }, [packages, retreatPrograms]);

  const [viewportWidth, setViewportWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);

  useEffect(() => {
    function handleResize() {
      setViewportWidth(window.innerWidth);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const programPerView = viewportWidth >= 1024 ? 4 : viewportWidth >= 768 ? 2 : 1;
  const programSlides = Math.max(1, Math.ceil(programItems.length / programPerView));

  useEffect(() => {
    if (programSlide > programSlides - 1) {
      setProgramSlide(programSlides - 1);
    }
  }, [programSlide, programSlides]);

  function scrollProgramTo(slide) {
    const node = programScrollRef.current;
    if (!node) return;
    const target = Math.min(programSlides - 1, Math.max(0, slide));
    const slideWidth = node.scrollWidth / programSlides;
    node.scrollTo({ left: slideWidth * target, behavior: "smooth" });
    setProgramSlide(target);
  }

  useEffect(() => {
    async function loadData() {
      try {
        const [depRes, docRes, pkgRes, blogRes, galRes, reviewRes, retreatRes] = await Promise.all([
          apiGet("/departments"),
          apiGet("/doctors"),
          apiGet("/packages"),
          apiGet("/blogs"),
          apiGet("/gallery"),
          apiGet("/patient-reviews?status=published"),
          apiGet("/retreat-programs"),
        ]);

        setDepartments(onlyPublished(depRes?.data || depRes || []).slice(0, 6));
        setDoctors(onlyPublished(docRes?.data || docRes || []).slice(0, 4));
        setPackages(onlyPublished(pkgRes?.data || pkgRes || []).slice(0, 3));
        setBlogs(onlyPublished(blogRes?.data || blogRes || []).slice(0, 3));
        setGalleryItems((galRes?.data || galRes || []).slice(0, 6));
        setReviews((reviewRes?.data || reviewRes || []).slice(0, 4));
        setRetreatPrograms(onlyPublished(retreatRes?.data || retreatRes || []).slice(0, 3));
      } catch (err) {
        console.error("Home data load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <>
      <section className="w-full bg-[#f4f8f5]">
        <div className="max-w-6xl mx-auto px-4 min-h-[75vh] flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <p className="tracking-wide text-sm text-green-700">HOLISTIC HEALING · KATHMANDU</p>

            <h1 className="text-3xl md:text-5xl font-semibold leading-tight text-gray-900">
              Your path to natural healing begins here.
            </h1>

            <p className="max-w-3xl mx-auto text-gray-600 text-base md:text-lg">
              We combine naturopathy, yoga, Ayurveda, physiotherapy and lifestyle medicine to treat the root cause of
              disease — not just the symptoms.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/appointments" className="px-6 py-3 rounded-full bg-green-700 text-white">
                Book an appointment
              </Link>

              <Link href="/packages" className="px-6 py-3 rounded-full border border-green-700 text-green-700">
                View health packages
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* QUICK ACCESS CARDS – subtle background */}
      <section className={`${sectionWrapper} bg-[#ecf3ee] pt-12`}>
        <div className={sectionContainer}>
          <motion.div {...fadeUp(0)} className="mb-6">
            <h2 className="text-xl md:text-2xl font-semibold text-[#10231a] mb-1">
              Find the care you need in seconds
            </h2>
            <p className="text-sm text-[#5a695e]">Quickly navigate departments, doctors, packages and bookings.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <QuickLinkCard
              title="Departments"
              text="Explore all specialties and find the right department."
              href="/departments"
            />
            <QuickLinkCard
              title="Our doctors"
              text="Meet naturopathy, Ayurveda, yoga and physiotherapy experts."
              href="/doctors"
            />
            <QuickLinkCard
              title="Health packages"
              text="Structured residential programs for detox and recovery."
              href="/packages"
            />
            <QuickLinkCard
              title="Book appointment"
              text="Choose a doctor, pick a date and confirm your slot."
              href="/appointments"
            />
          </div>
        </div>
      </section>

      {/* WHY PATIENTS CHOOSE – white background */}
      <section className={`${sectionWrapper} bg-white`}>
        <div className={sectionContainer}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 px-4 lg:items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <p className="text-xs uppercase tracking-[0.18em] text-[#2F8D59] mb-2">Why patients choose Annapurna</p>
              <h2 className="text-2xl md:text-3xl font-semibold text-[#10231a] mb-3 whitespace-nowrap">
                Nature-based healing backed by clinical care
              </h2>
              <p className="text-sm md:text-base text-[#4f5d52] mb-4">
                We design personalised treatment plans that combine naturopathy, yoga, physiotherapy, Ayurveda and
                nutrition – guided by qualified doctors and therapists.
              </p>
              <ul className="space-y-2 text-sm text-[#425046]">
                <li>• Focus on root cause, not just symptom relief</li>
                <li>• Residential healing environment with daily therapies</li>
                <li>• Medical evaluation and progress tracking</li>
                <li>• Long-term lifestyle guidance after discharge</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-6 lg:self-center"
            >
              {[
                { label: "Years of care", value: "15+" },
                { label: "Expert doctors", value: "30+" },
                { label: "Patients cared for", value: "10k+" },
                { label: "Average satisfaction", value: "4.8★" },
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 * idx }}
                  viewport={{ once: true }}
                >
                  <StatCard label={stat.label} value={stat.value} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* DEPARTMENTS – horizontal scroll */}
      <section className={`${sectionWrapper} bg-[#f5f8f4]`}>
        <div className={sectionContainer}>
          <SectionHeader
            eyebrow="Departments"
            title="Explore specialized units"
            subtitle="From physiotherapy and Ayurveda to yoga and lifestyle medicine."
            linkHref="/departments"
            linkText="View all departments"
          />

          <motion.div {...fadeUp(0.1)} className="relative">
            {loading && <SkeletonRow count={4} />}

            {!loading && departments.length > 0 && (
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
                {departments.map((dep) => (
                  <div key={dep._id} className="flex-shrink-0 w-[380px]">
                    <DepartmentCard department={dep} />
                  </div>
                ))}
              </div>
            )}

            {!loading && departments.length === 0 && (
              <p className="text-sm text-[#5a695e]">Departments will appear here once added.</p>
            )}
          </motion.div>
        </div>
      </section>

      {/* DOCTORS */}
      <section className={`${sectionWrapper} bg-white`}>
        <div className={sectionContainer}>
          <SectionHeader
            eyebrow="Our doctors"
            title="Meet our healing team"
            subtitle="Doctors and therapists combining traditional wisdom with modern understanding."
            linkHref="/doctors"
            linkText="Meet the full team"
          />

          <motion.div {...fadeUp(0.1)} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {loading && <SkeletonGrid count={4} />}

            {!loading &&
              doctors.map((doc) => (
                <DoctorCard key={doc._id} doc={doc} />
              ))}

            {!loading && doctors.length === 0 && (
              <p className="text-sm text-[#5a695e]">Doctors will appear here once added in the admin panel.</p>
            )}
          </motion.div>
        </div>
      </section>

      {/* PACKAGES */}
      <section className={`${sectionWrapper} bg-[#ecf3ee]`}>
        <div className={sectionContainer}>
          <SectionHeader
            eyebrow="Health packages"
            title="Structured programs & retreats"
            subtitle="Residential packages and retreat programs tailored for detox, pain, lifestyle disorders and stress."
            linkHref="/packages"
            linkText="View all packages"
          />

          <motion.div {...fadeUp(0.1)} className="relative">
            {loading && <SkeletonGrid count={3} />}
            {!loading && programItems.length > 0 && (
              <div className="relative">
                <div
                  ref={programScrollRef}
                  className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory scroll-smooth"
                >
                  {programItems.map((item, idx) => (
                    <Link
                      key={`${item.type}-${item.id}`}
                      href={item.href}
                      className="snap-start flex-shrink-0 w-full sm:w-[48%] lg:w-[23%] rounded-2xl bg-white border border-[#d3e5da] overflow-hidden shadow-sm flex flex-col transition hover:-translate-y-1 hover:shadow-md min-h-[320px]"
                    >
                      <div className="relative h-40 bg-[#cfe4d6] overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#d7efe2] to-[#c3e0d1]" />
                        )}
                        <span className="absolute top-2 left-2 px-2 py-1 text-[11px] font-semibold rounded-full bg-black/70 text-white">
                          {item.tag}
                        </span>
                      </div>
                      <div className="p-3 flex flex-col gap-2 flex-1">
                        <p className="text-sm font-semibold text-[#10231a] line-clamp-2">{item.title}</p>
                        {item.description ? (
                          <p className="text-xs text-[#5a695e] line-clamp-3">{item.description}</p>
                        ) : null}
                        <div className="text-xs text-[#1c8c5b] font-semibold flex items-center justify-between mt-2">
                          <span>{item.price}</span>
                          {item.duration ? (
                            <span className="px-2 py-0.5 rounded-full bg-[#ecf7f0] text-[#2f7f5b] border border-[#b6dec5]">
                              {item.duration}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                {programSlides > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => scrollProgramTo(programSlide - 1)}
                      disabled={programSlide === 0}
                      className="hidden lg:flex absolute -left-3 top-1/2 -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-100 shadow-sm disabled:opacity-50"
                      aria-label="Previous programs"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollProgramTo(programSlide + 1)}
                      disabled={programSlide >= programSlides - 1}
                      className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-100 shadow-sm disabled:opacity-50"
                      aria-label="Next programs"
                    >
                      →
                    </button>
                    <div className="flex justify-center gap-2 mt-2">
                      {Array.from({ length: programSlides }).map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => scrollProgramTo(idx)}
                          className={`h-2.5 w-2.5 rounded-full ${idx === programSlide ? "bg-emerald-700" : "bg-emerald-700/30"}`}
                          aria-label={`Go to program slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
            {!loading && programItems.length === 0 && (
              <p className="text-sm text-[#5a695e]">Programs will appear here once created from the admin panel.</p>
            )}
          </motion.div>
        </div>
      </section>

      {/* BLOGS */}
      <section className={`${sectionWrapper} bg-[#f5f8f4]`}>
        <div className={sectionContainer}>
          <SectionHeader
            eyebrow="Stories & Reviews"
            title="Insights and patient journeys"
            subtitle="Read articles on natural healing and real patient experiences."
            linkHref="/blog"
            linkText="Explore all stories"
          />

          <motion.div {...fadeUp(0.1)} className="relative">
            {loading && <SkeletonGrid count={3} />}
            {!loading && storyItems.length > 0 && (
              <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory">
                {storyItems.map((item) => (
                  <StoryCard key={`${item.type}-${item.id}`} item={item} />
                ))}
              </div>
            )}
            {!loading && storyItems.length === 0 && (
              <p className="text-sm text-[#5a695e]">Stories will appear here once you publish articles or reviews.</p>
            )}
          </motion.div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-10 md:py-14 bg-[#d7efe2]">
        <div className={sectionContainer}>
          <motion.div
            {...fadeUp(0)}
            className="rounded-3xl bg-white/70 border border-[#b4d8c3] px-6 md:px-10 py-8 md:py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-sm"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#2f7f5b] mb-2">Start your journey</p>
              <h2 className="text-xl md:text-2xl font-semibold text-[#10231a] mb-2">
                Ready to discuss your health concerns?
              </h2>
              <p className="text-sm md:text-base text-[#4f5d52] max-w-xl">
                Share your condition with our team and we will help you choose the right department or health package.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/appointments"
                className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-[#1c8c5b] text-white text-sm font-medium shadow-sm hover:bg-[#177047] transition"
              >
                Book an appointment
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-5 py-3 rounded-full border border-[#99c7af] text-[#1c8c5b] text-sm font-medium bg-white/60 hover:bg-white transition"
              >
                Talk to our team
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

/* ========== SMALL COMPONENTS ========== */

function SectionHeader({ eyebrow, title, subtitle, linkHref, linkText }) {
  return (
    <motion.div {...fadeUp(0)} className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
      <div>
        {eyebrow && (
          <p className="text-xs uppercase tracking-[0.18em] text-[#2f7f5b] mb-1">
            {eyebrow}
          </p>
        )}
        <h2 className="text-xl md:text-2xl font-semibold text-[#10231a]">{title}</h2>
        {subtitle && <p className="text-sm text-[#5a695e] mt-1 max-w-2xl">{subtitle}</p>}
      </div>
      {linkHref && linkText && (
        <Link href={linkHref} className="inline-flex items-center gap-1 text-xs md:text-sm text-[#1c8c5b] hover:text-[#145a3b]">
          <span>{linkText}</span>
          <span>→</span>
        </Link>
      )}
    </motion.div>
  );
}

function QuickLinkCard({ title, text, href }) {
  const icon = (() => {
    switch (title) {
      case "Departments":
        return (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.7">
            <rect x="4" y="4" width="6" height="6" rx="1.2" />
            <rect x="14" y="4" width="6" height="6" rx="1.2" />
            <rect x="4" y="14" width="6" height="6" rx="1.2" />
            <rect x="14" y="14" width="6" height="6" rx="1.2" />
          </svg>
        );
      case "Our doctors":
        return (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.7">
            <circle cx="12" cy="7" r="3.2" />
            <path d="M6.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
            <path d="M16 14l2-2" />
            <path d="M18 12h2.4" />
          </svg>
        );
      case "Health packages":
        return (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M4 7.5 12 4l8 3.5-8 3.5-8-3.5Z" />
            <path d="M4 7.5V16l8 4 8-4V7.5" />
            <path d="M12 11v9" />
          </svg>
        );
      case "Book appointment":
        return (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.7">
            <rect x="4" y="5" width="16" height="15" rx="2" />
            <path d="M9 3v4" />
            <path d="M15 3v4" />
            <path d="M4 9h16" />
            <path d="M9 14h6" />
          </svg>
        );
      default:
        return (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M4 6h16" />
            <path d="M4 12h16" />
            <path d="M4 18h16" />
          </svg>
        );
    }
  })();

  return (
    <motion.div whileHover={{ y: -3, scale: 1.01 }} className="rounded-2xl bg-white/80 border border-[#d3e5da] px-4 py-4 flex flex-col justify-between shadow-sm">
      <div>
        <h3 className="text-sm font-semibold text-[#10231a] mb-1 flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#e8f5ed] text-[#1c8c5b]">
            {icon}
          </span>
          <span>{title}</span>
        </h3>
        <p className="text-xs text-[#5a695e] mb-2">{text}</p>
      </div>
      <Link href={href} className="text-xs font-medium text-[#1c8c5b] hover:text-[#145a3b]">
        Open →
      </Link>
    </motion.div>
  );
}

function SkeletonRow({ count = 4 }) {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="min-w-[180px] h-28 rounded-2xl bg-[#dde7e1] animate-pulse" />
      ))}
    </div>
  );
}

function SkeletonGrid({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-32 rounded-2xl bg-[#dde7e1] animate-pulse" />
      ))}
    </>
  );
}


function DoctorCard({ doc }) {
  const image = doc.photoUrl || doc.photo || doc.image;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className="rounded-2xl bg-[#f7faf7] border border-[#d3e5da] overflow-hidden shadow-sm flex flex-col h-full"
    >
      <div className="relative w-full aspect-[4/5] bg-[#cfe4d6] overflow-hidden">
        {image ? (
          <img src={image} alt={doc.name || "Doctor"} className="absolute inset-0 w-full h-full object-cover object-center" />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#d7efe2] to-[#c3e0d1]" />
        )}
      </div>
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-sm font-semibold text-[#10231a]">{doc.name || "Doctor"}</p>
        <p className="text-xs text-[#5a695e]">{doc.specialization || doc.departmentName || "Naturopathy & Wellness"}</p>
      </div>
    </motion.div>
  );
}

function GalleryThumb({ item }) {
  const thumb = item.images?.[0];

  return (
    <Link href={`/gallery/${item._id}`}>
      <motion.div
        whileHover={{ y: -3 }}
        className="relative rounded-2xl overflow-hidden border border-[#d3e5da] bg-[#cfe4d6] aspect-[4/3]"
      >
        {thumb ? (
          <img
            src={thumb}
            alt={item.title || "Gallery item"}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#d7efe2] to-[#c3e0d1]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent opacity-80" />
        <div className="absolute bottom-2 left-2 right-2">
          <p className="text-[11px] font-semibold text-white line-clamp-1">{item.title || "Gallery"}</p>
        </div>
      </motion.div>
    </Link>
  );
}

function StoryCard({ item }) {
  const isReview = item.type === "review";
  const badgeStyles = "bg-white/90 text-[#10231a] border border-white/80 shadow-sm";
  const badgeIcon = isReview ? "💬" : "📰";

  return (
    <Link
      href={item.href}
      className="min-w-[260px] max-w-[260px] snap-start"
    >
      <div className="min-h-[360px] rounded-2xl bg-white border border-[#d3e5da] overflow-hidden shadow-sm flex flex-col transition hover:-translate-y-1 hover:shadow-md h-full">
        <div className="relative h-40 bg-[#e6eef2] overflow-hidden flex items-center justify-center">
          {item.image ? (
            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-slate-500 text-lg gap-2">
              <span role="img" aria-label="story">
                {badgeIcon}
              </span>
              <span className="text-sm">{isReview ? "Patient story" : "Latest article"}</span>
            </div>
          )}
          <span
            className={`absolute top-2 left-2 px-2 py-1 text-[11px] font-semibold rounded-full ${badgeStyles} inline-flex items-center gap-1`}
          >
            <span>{badgeIcon}</span>
            <span>{item.tag}</span>
          </span>
        </div>
        <div className="p-4 flex flex-col gap-2 flex-1">
          <p className="text-sm font-semibold text-[#10231a] line-clamp-2 overflow-hidden text-ellipsis">{item.title}</p>
          <div className="min-h-[18px] text-xs text-slate-500 flex items-center gap-2">
            {isReview && (item.patientName || item.country || item.rating) ? (
              <>
                {item.patientName ? <span>{item.patientName}</span> : null}
                {item.country ? <span>· {item.country}</span> : null}
                {item.rating ? (
                  <span className="flex items-center gap-1 text-amber-500">
                    {"★★★★★".slice(0, Math.max(0, Math.min(5, Number(item.rating) || 0)))}
                    <span className="text-[11px] text-slate-500 ml-1">{`${item.rating}/5`}</span>
                  </span>
                ) : null}
              </>
            ) : null}
          </div>
          {item.description ? (
            <p className="text-xs text-[#5a695e] line-clamp-3 overflow-hidden text-ellipsis">{item.description}</p>
          ) : (
            <div className="text-xs text-[#5a695e] h-[42px]" />
          )}
          <span className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 mt-auto">
            Read full story →
          </span>
        </div>
      </div>
    </Link>
  );
}

function BlogCard({ post }) {
  const thumb =
    post.mediaUrl ||
    post.coverImage ||
    (Array.isArray(post.images) && post.images.length ? post.images[0] : null) ||
    post.image;

  return (
    <Link href={`/blog/${post.slug || post._id}`}>
      <motion.div whileHover={{ y: -3, scale: 1.01 }} className="rounded-2xl bg-white border border-[#d3e5da] overflow-hidden shadow-sm flex flex-col">
        <div className="h-40 md:h-44 bg-[#cfe4d6] overflow-hidden">
          {thumb ? (
            <img src={thumb} alt={post.title || "Article"} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#d7efe2] to-[#c3e0d1]" />
          )}
        </div>
        <div className="p-3 flex flex-col gap-1">
          <p className="text-sm font-semibold text-[#10231a] line-clamp-2">{post.title || "Article"}</p>
          {post.shortDescription && <p className="text-xs text-[#5a695e] line-clamp-3">{post.shortDescription}</p>}
        </div>
      </motion.div>
    </Link>
  );
}
