"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const sectionAnimation = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const cardAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function HomeDynamicSections({ departments = [], doctors = [], packages = [], gallery = [], blogs = [] }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // brief skeleton visibility even with server data
    const t = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-10 md:space-y-12 pb-14 md:pb-20">
      {/* Quick access */}
      <SectionShell title="Quick access" subtitle="Find the care you need in seconds">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            {
              title: "Departments",
              desc: "Explore specialties and therapies.",
              href: "/departments",
              icon: "🏥",
            },
            {
              title: "Our doctors",
              desc: "Meet the experts ready to help.",
              href: "/doctors",
              icon: "🩺",
            },
            {
              title: "Health packages",
              desc: "Structured programs for recovery.",
              href: "/packages",
              icon: "📦",
            },
            {
              title: "Book appointment",
              desc: "Pick a date and confirm your slot.",
              href: "/appointments",
              icon: "📅",
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              variants={cardAnimation}
              className="group rounded-2xl border border-white/10 bg-[#070b12] p-4 flex items-start gap-3 transition duration-200 hover:-translate-y-1 hover:border-[#18a6a0]"
              whileHover={{ scale: 1.02 }}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#18a6a0]/10 text-lg">
                {item.icon}
              </span>
              <div className="space-y-1">
                <Link href={item.href} className="text-white font-semibold hover:text-[#18a6a0] transition">
                  {item.title}
                </Link>
                <p className="text-sm text-slate-300">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionShell>

      {/* Why choose us */}
      <SectionShell
        title="Nature-based healing backed by clinical care"
        subtitle="We combine naturopathy, yoga, physiotherapy and lifestyle medicine to treat the root cause."
      >
        <div className="flex flex-col gap-4 md:gap-6 bg-[#050811] border border-white/10 rounded-3xl p-5 md:p-7 shadow-lg shadow-black/30">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <p className="text-sm md:text-base text-slate-200 max-w-3xl">
              Personalized programs designed for detox, pain management, and lifestyle disorders.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center px-4 py-2 rounded-full bg-[#18a6a0] hover:bg-[#0d5f5a] text-white text-sm font-semibold transition"
            >
              Talk to our team
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Years of care", value: "15+" },
              { label: "Expert doctors", value: "30+" },
              { label: "Patients cared for", value: "10k+" },
              { label: "Avg. satisfaction", value: "4.8★" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-[#0b1017] px-4 py-5 text-center shadow-md"
              >
                <p className="text-2xl font-bold text-[#18a6a0]">{item.value}</p>
                <p className="text-xs uppercase tracking-wide text-slate-400 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionShell>

      {/* Departments */}
      <SectionShell title="Departments" subtitle="Explore specialized units and therapies.">
        {loading && departments.length === 0 ? (
          <SkeletonGrid count={6} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {departments.map((d) => (
              <motion.a
                key={d._id}
                href={`/departments/${d.slug || d._id}`}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#070b12] transition hover:border-[#18a6a0]"
                variants={cardAnimation}
                whileHover={{ scale: 1.01, y: -4 }}
              >
                <div className="h-40 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
                  {d.imageUrl && (
                    <img
                      src={d.imageUrl}
                      alt={d.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-white font-semibold">{d.name}</p>
                  <p className="text-sm text-slate-300 line-clamp-3">
                    {d.description?.slice(0, 100) || d.shortDescription || "Discover more"}
                  </p>
                  <span className="text-sm text-[#18a6a0] inline-flex items-center">
                    View details <span className="ml-1">→</span>
                  </span>
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </SectionShell>

      {/* Doctors carousel */}
      <SectionShell title="Our doctors" subtitle="Meet the experts behind your care.">
        {loading && doctors.length === 0 ? (
          <SkeletonGrid count={4} />
        ) : (
          <div
            className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory"
            aria-label="Featured doctors carousel"
          >
            {doctors.map((doc) => (
              <motion.a
                key={doc._id}
                href={`/doctors/${doc.slug || doc._id}`}
                className="min-w-[260px] snap-start rounded-2xl border border-white/10 bg-[#070b12] p-4 flex flex-col gap-3 transition hover:border-[#18a6a0]"
                variants={cardAnimation}
                whileHover={{ scale: 1.02, y: -4 }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-full overflow-hidden bg-gradient-to-br from-[#18a6a0]/20 to-[#2f80ed]/20 border border-white/10">
                    {doc.photo ? (
                      <img src={doc.photo} alt={doc.name} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{doc.name}</p>
                    <p className="text-xs text-[#18a6a0]">{doc.title}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 line-clamp-2">
                  {doc.departmentId?.name || doc.department?.name || "Specialist"}
                </p>
                {doc.experienceYears ? (
                  <span className="text-xs inline-flex px-2 py-1 rounded-full bg-[#18a6a0]/15 text-[#18a6a0] border border-[#18a6a0]/40">
                    {doc.experienceYears}+ yrs experience
                  </span>
                ) : null}
              </motion.a>
            ))}
          </div>
        )}
      </SectionShell>

      {/* Packages */}
      <SectionShell title="Health Packages" subtitle="Tailored programs for recovery and detox.">
        {loading && packages.length === 0 ? (
          <SkeletonGrid count={3} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {packages.map((pkg, idx) => (
              <motion.a
                key={pkg._id}
                href={`/pack/${pkg.slug || pkg._id}`}
                className="group rounded-2xl border border-white/10 bg-[#05070d] p-5 md:p-6 shadow-[0_18px_45px_rgba(0,0,0,0.45)] transition hover:border-[#18a6a0]"
                variants={cardAnimation}
                whileHover={{ scale: 1.02, y: -4 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 text-xs rounded-full bg-[#18a6a0]/15 text-[#18a6a0] border border-[#18a6a0]/40">
                    {pkg.tag || "Residential program"}
                  </span>
                  {pkg.duration && (
                    <span className="text-xs text-slate-300">Total days: {pkg.duration}</span>
                  )}
                </div>
                <p className="text-lg font-semibold text-white mb-1">{pkg.title || pkg.name}</p>
                <p className="text-sm text-slate-300 line-clamp-3 mb-3">
                  {pkg.shortDescription || pkg.description || ""}
                </p>
                <p className="text-teal-300 font-semibold mb-4">
                  {pkg.price ? `Rs. ${pkg.price}` : "Contact for pricing"}
                </p>
                {Array.isArray(pkg.departments) && pkg.departments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {pkg.departments.map((dep) => (
                      <span
                        key={dep._id || dep}
                        className="text-xs px-2 py-1 rounded-full bg-[#0b1017] border border-white/10 text-slate-200"
                      >
                        {dep.name || dep}
                      </span>
                    ))}
                  </div>
                )}
                <span className="text-sm text-[#18a6a0] inline-flex items-center">
                  View details <span className="ml-1">→</span>
                </span>
              </motion.a>
            ))}
          </div>
        )}
      </SectionShell>

      {/* Gallery */}
      <SectionShell title="Gallery" subtitle="Real moments from treatments and retreats.">
        {loading && gallery.length === 0 ? (
          <SkeletonGrid count={3} />
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-300">A glimpse into our healing environment.</p>
              <Link
                href="/gallery"
                className="text-sm text-[#18a6a0] hover:text-white transition inline-flex items-center"
              >
                View full gallery →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gallery.slice(0, 3).map((g, idx) => (
                <motion.div
                  key={g._id || idx}
                  className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#070b12] h-48 md:h-56"
                  variants={cardAnimation}
                  whileHover={{ scale: 1.01, y: -4 }}
                >
                  {g.images?.[0] ? (
                    <img
                      src={g.images[0]}
                      alt={g.title || "Gallery"}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-slate-800 to-slate-900" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex items-end">
                    <div>
                      <p className="text-white font-semibold">{g.title || "Gallery item"}</p>
                      <p className="text-xs text-slate-300 line-clamp-2">{g.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </SectionShell>

      {/* Latest articles */}
      <motion.section
        variants={sectionAnimation}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="bg-[#070b12] border border-white/10 rounded-3xl max-w-6xl mx-auto px-4 md:px-6 py-10 space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold tracking-wide uppercase text-[#18a6a0]">
              Latest Articles
            </p>
            <h3 className="text-2xl md:text-3xl font-bold text-white">Insights from our specialists</h3>
          </div>
          <Link href="/blog" className="text-sm text-[#18a6a0] hover:text-white transition">
            View all articles →
          </Link>
        </div>

        {loading && blogs.length === 0 ? (
          <SkeletonGrid count={3} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {blogs.map((b) => (
              <motion.a
                key={b._id}
                href={`/blog/${b.slug || b._id}`}
                className="group rounded-2xl border border-white/10 bg-[#0b1017] p-5 transition hover:border-[#18a6a0]"
                variants={cardAnimation}
                whileHover={{ scale: 1.01, y: -4 }}
              >
                <p className="text-xs uppercase tracking-wide text-[#18a6a0] mb-2">
                  {b.category || "Article"}
                </p>
                <p className="text-lg font-semibold text-white group-hover:text-[#18a6a0] transition">
                  {b.title}
                </p>
                <p className="text-sm text-slate-300 mt-2 line-clamp-3">{b.excerpt || b.shortDescription}</p>
                <span className="text-sm text-[#18a6a0] inline-flex items-center mt-3">
                  Read article →
                </span>
              </motion.a>
            ))}
          </div>
        )}
      </motion.section>

      {error && (
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="rounded-xl border border-rose-500/30 bg-rose-900/20 text-rose-100 px-4 py-3">
            {error}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionShell({ title, subtitle, children }) {
  return (
    <motion.section
      variants={sectionAnimation}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="max-w-6xl mx-auto px-4 md:px-6 space-y-4"
    >
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
        <div>
          <p className="text-sm font-semibold tracking-wide uppercase text-[#18a6a0]">{title}</p>
          {subtitle && <h3 className="text-xl md:text-2xl font-bold text-white">{subtitle}</h3>}
        </div>
      </div>
      <section className="border border-white/5 bg-[#070b12] rounded-3xl p-5 md:p-7">{children}</section>
    </motion.section>
  );
}

function SkeletonGrid({ count }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl bg-slate-800/60 h-32" />
      ))}
    </div>
  );
}
