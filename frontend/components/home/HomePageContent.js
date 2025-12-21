"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { apiGet } from "@/lib/api";

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

const sectionWrapper = "py-20";
const sectionContainer = "max-w-7xl mx-auto px-4";

export default function HomePageContent() {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [packages, setPackages] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [depRes, docRes, pkgRes, blogRes, galRes] = await Promise.all([
          apiGet("/departments"),
          apiGet("/doctors"),
          apiGet("/packages"),
          apiGet("/blogs"),
          apiGet("/gallery"),
        ]);

        setDepartments((depRes?.data || depRes || []).slice(0, 6));
        setDoctors((docRes?.data || docRes || []).slice(0, 4));
        setPackages((pkgRes?.data || pkgRes || []).slice(0, 3));
        setBlogs((blogRes?.data || blogRes || []).slice(0, 3));
        setGalleryItems((galRes?.data || galRes || []).slice(0, 6));
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
      <section
        className="relative min-h-[75vh] flex flex-col items-center pt-24 pb-36 bg-white"
      >
        <div className="w-full max-w-5xl px-6 text-center flex flex-col items-center space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <p className="text-xs tracking-[0.2em] uppercase text-[#2F8D59]">
              Holistic Healing · Kathmandu
            </p>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[#1b3c32] leading-snug md:whitespace-nowrap">
              Your path to natural healing begins here.
            </h1>

            <p className="text-sm md:text-base text-[#3f4d44] leading-relaxed">
              We combine naturopathy, yoga, Ayurveda, physiotherapy and lifestyle medicine
              to treat the root cause of disease – not just the symptoms.
            </p>

            <div className="w-full max-w-3xl mx-auto flex flex-wrap gap-6 justify-center mt-14 md:mt-20 mb-10 md:mb-16">
              <Link
                href="/appointments"
                className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-[#2F8D59] text-white text-sm font-medium shadow-sm hover:bg-[#256b46] transition"
              >
                Book an appointment
              </Link>

              <Link
                href="/packages"
                className="inline-flex items-center justify-center px-5 py-3 rounded-full border border-[#b7e0c5] text-[#2F8D59] text-sm font-medium bg-white hover:border-[#2F8D59] transition"
              >
                View health packages
              </Link>
            </div>
          </motion.div>

        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          viewport={{ once: true }}
          className="absolute left-0 right-0 -bottom-6 md:-bottom-8 z-10 w-full px-4"
        >
          <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md border border-[#cfe8d6] p-6 flex flex-wrap md:flex-nowrap items-center gap-3 justify-center">
            <input
              className="flex-1 min-w-[180px] bg-white border border-[#cfe8d6] rounded-xl px-3 py-2.5 text-sm text-[#10231a] placeholder:text-slate-500 focus:outline-none focus:border-[#2F8D59]"
              placeholder="Search doctors (e.g., Orthopedic)"
            />
            <input
              className="flex-1 min-w-[180px] bg-white border border-[#cfe8d6] rounded-xl px-3 py-2.5 text-sm text-[#10231a] placeholder:text-slate-500 focus:outline-none focus:border-[#2F8D59]"
              placeholder="Search departments (e.g., Physiotherapy)"
            />
            <input
              type="date"
              className="w-[180px] bg-white border border-[#cfe8d6] rounded-xl px-3 py-2.5 text-sm text-[#10231a] placeholder:text-slate-500 focus:outline-none focus:border-[#2F8D59]"
            />
            <Link
              href="/doctors"
              className="px-6 py-3 rounded-xl bg-[#2F8D59] hover:bg-[#256b46] text-white text-sm font-semibold transition text-center whitespace-nowrap"
            >
              Search
            </Link>
          </div>
        </motion.div>
      </section>

      {/* QUICK ACCESS CARDS – subtle background */}
      <section className={`${sectionWrapper} bg-[#ecf3ee] pt-32`}>
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
                  <DepartmentCard key={dep._id} dep={dep} />
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
            title="Structured treatment programs"
            subtitle="Residential programs tailored for detox, pain, lifestyle disorders and stress."
            linkHref="/packages"
            linkText="View all packages"
          />

          <motion.div {...fadeUp(0.1)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {loading && <SkeletonGrid count={3} />}

            {!loading &&
              packages.map((pkg) => (
                <PackageCard key={pkg._id} pkg={pkg} />
              ))}

            {!loading && packages.length === 0 && (
              <p className="text-sm text-[#5a695e]">Packages will appear here once created from the admin panel.</p>
            )}
          </motion.div>
        </div>
      </section>

      {/* GALLERY */}
      <section className={`${sectionWrapper} bg-white`}>
        <div className={sectionContainer}>
          <SectionHeader
            eyebrow="Gallery"
            title="Moments from Annapurna"
            subtitle="Glimpses of therapies, yoga sessions, campus and patient journeys."
            linkHref="/gallery"
            linkText="View full gallery"
          />

          <motion.div {...fadeUp(0.1)} className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {loading && <SkeletonGrid count={6} />}

            {!loading &&
              galleryItems.map((item) => (
                <GalleryThumb key={item._id} item={item} />
              ))}

            {!loading && galleryItems.length === 0 && (
              <p className="text-sm text-[#5a695e]">Gallery items will appear here once you upload photos or videos.</p>
            )}
          </motion.div>
        </div>
      </section>

      {/* BLOGS */}
      <section className={`${sectionWrapper} bg-[#f5f8f4]`}>
        <div className={sectionContainer}>
          <SectionHeader
            eyebrow="Latest articles"
            title="Insights on natural healing"
            subtitle="Read about therapies, lifestyle tips, and patient stories."
            linkHref="/blog"
            linkText="Explore all articles"
          />

          <motion.div {...fadeUp(0.1)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {loading && <SkeletonGrid count={3} />}

            {!loading &&
              blogs.map((post) => (
                <BlogCard key={post._id} post={post} />
              ))}

            {!loading && blogs.length === 0 && (
              <p className="text-sm text-[#5a695e]">Articles will appear here once you publish blog posts.</p>
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

function DepartmentCard({ dep }) {
  const image = dep.image || dep.heroImage || dep.coverImage || dep.photo;

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      className="min-w-[220px] rounded-2xl bg-white border border-[#d3e5da] overflow-hidden shadow-sm flex flex-col"
    >
      <div className="h-32 bg-[#cfe4d6] overflow-hidden">
        {image ? (
          <img src={image} alt={dep.name || "Department"} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#d7efe2] to-[#c3e0d1]" />
        )}
      </div>
      <div className="px-4 py-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#10231a] mb-1">{dep.name || "Department"}</h3>
          {dep.shortDescription && <p className="text-xs text-[#5a695e] line-clamp-3">{dep.shortDescription}</p>}
        </div>
        <Link href={`/departments/${dep.slug || dep._id}`} className="mt-3 text-xs font-medium text-[#1c8c5b] hover:text-[#145a3b]">
          View details →
        </Link>
      </div>
    </motion.div>
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

function PackageCard({ pkg }) {
  const daysLabel = pkg.duration ? `${pkg.duration} days` : null;
  const image =
    pkg.imageUrl ||
    pkg.image ||
    pkg.photo ||
    pkg.coverImage ||
    pkg.heroImage;
  return (
    <motion.div whileHover={{ y: -4, scale: 1.02 }} className="rounded-2xl bg-white border border-[#d3e5da] shadow-sm flex flex-col overflow-hidden">
      <div className="relative w-full aspect-[4/3] bg-[#cfe4d6] overflow-hidden">
        {image ? (
          <img src={image} alt={pkg.name || "Package"} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#d7efe2] to-[#c3e0d1]" />
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          <h3 className="text-sm font-semibold text-[#10231a] mb-1">{pkg.name || "Package"}</h3>
          {pkg.shortDescription && <p className="text-xs text-[#5a695e] line-clamp-3">{pkg.shortDescription}</p>}
        </div>
        <div className="mt-1 flex items-center justify-between text-xs">
          <div className="text-[#1c8c5b] font-semibold">{pkg.price ? `Rs. ${pkg.price}` : ""}</div>
          {daysLabel && (
            <span className="px-2 py-0.5 rounded-full bg-[#ecf7f0] text-[#2f7f5b] border border-[#b6dec5]">
              {daysLabel}
            </span>
          )}
        </div>
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

function BlogCard({ post }) {
  const thumb = post.mediaUrl || post.coverImage;

  return (
    <Link href={`/blog/${post.slug || post._id}`}>
      <motion.div whileHover={{ y: -3, scale: 1.01 }} className="rounded-2xl bg-white border border-[#d3e5da] overflow-hidden shadow-sm flex flex-col">
        <div className="h-28 bg-[#cfe4d6] overflow-hidden">
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
