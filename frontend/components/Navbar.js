"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Container from "./Container";
import { apiGet } from "@/lib/api";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [courseCategories, setCourseCategories] = useState([]);
  const [programsOpen, setProgramsOpen] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const pathname = usePathname();

  const primaryNav = [
    { href: '/departments', label: 'Departments' },
    { href: '/doctors', label: 'Doctors' },
    { href: '/patient-reviews', label: 'Patient Reviews' },
  ];

  const programLinks = [
    { href: '/packages', label: 'Health Packages' },
    { href: '/retreat-programs', label: 'Retreat Programs' },
    { href: '/health-programs', label: 'Health Programs' },
  ];

  const courseLinks = [{ href: '/courses', label: 'All Courses' }, ...courseCategories.map((c) => ({ href: `/courses?category=${c.slug}`, label: c.name }))];

  const secondaryNav = [
    { href: '/about', label: 'About Us' },
    { href: '/blog', label: 'Blog' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/contact', label: 'Contact' },
  ];

  const isActive = (href) => {
    if (!pathname) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  useEffect(() => {
    async function loadCourseCategories() {
      try {
        const res = await apiGet("/course-categories/active");
        const data = res?.data || res || [];
        setCourseCategories(
          data.map((c) => ({ name: c.name, slug: c.slug })).filter((c) => c.name && c.slug)
        );
      } catch (err) {
        console.error("Course categories load error:", err);
      }
    }
    loadCourseCategories();
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-primary-teal to-primary-dark shadow-md">
      <Container className="h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/images/logo.png" alt="Hospital Logo" width={48} height={48} className="rounded-md" />
          <span className="text-white text-xl font-semibold tracking-tight">
            Annapurna Nature Cure Hospital
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-5 text-white ml-auto">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition pb-1 border-b-2 border-transparent ${
                isActive(item.href)
                  ? 'text-[#b9f2d5] font-semibold border-white/80'
                  : 'hover:text-primary-light'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="relative">
            <button
              onClick={() => setProgramsOpen((p) => !p)}
              className={`transition pb-1 border-b-2 border-transparent flex items-center gap-1 ${
                isActive('/packages') || isActive('/retreat-programs') || isActive('/health-programs')
                  ? 'text-[#b9f2d5] font-semibold border-white/80'
                  : 'hover:text-primary-light'
              }`}
              aria-haspopup="true"
              aria-expanded={programsOpen}
            >
              Our Programs
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {programsOpen && (
              <div
                className="absolute left-0 mt-2 w-48 bg-white text-[#10231a] rounded-lg shadow-xl border border-[#dfe8e2] overflow-hidden"
                onMouseEnter={() => setProgramsOpen(true)}
                onMouseLeave={() => setProgramsOpen(false)}
              >
                {programLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block px-4 py-3 text-sm hover:bg-[#f0f7f3] ${
                      isActive(link.href) ? 'font-semibold text-primary-teal' : ''
                    }`}
                    onClick={() => setProgramsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => setCoursesOpen((p) => !p)}
              className={`transition pb-1 border-b-2 border-transparent flex items-center gap-1 ${
                isActive('/courses')
                  ? 'text-[#b9f2d5] font-semibold border-white/80'
                  : 'hover:text-primary-light'
              }`}
              aria-haspopup="true"
              aria-expanded={coursesOpen}
            >
              Courses
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {coursesOpen && (
              <div
                className="absolute left-0 mt-2 w-44 bg-white text-[#10231a] rounded-lg shadow-xl border border-[#dfe8e2] overflow-hidden"
                onMouseEnter={() => setCoursesOpen(true)}
                onMouseLeave={() => setCoursesOpen(false)}
              >
                {courseLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block px-4 py-3 text-sm hover:bg-[#f0f7f3] ${
                      isActive(link.href) ? 'font-semibold text-primary-teal' : ''
                    }`}
                    onClick={() => setCoursesOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        <div className="hidden md:flex items-center gap-2 ml-2">
          <Link
            href="/appointments"
            className="px-4 py-2 rounded-full bg-white text-[#0f1f17] font-semibold hover:bg-[#b9f2d5] hover:text-[#0f1f17] transition"
          >
            Book Appointment
          </Link>
          <button
            className="p-1 text-white hover:text-[#b9f2d5] transition focus:outline-none focus:ring-2 focus:ring-white/60 rounded-full flex items-center justify-center"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="w-7 h-7"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex md:hidden items-center gap-2 text-white ml-auto">
          <Link
            href="/appointments"
            className="px-3 py-1.5 rounded-full bg-white text-[#0f1f17] font-semibold hover:bg-[#b9f2d5] hover:text-[#0f1f17] transition"
          >
            Book
          </Link>
          <button
            className="p-1 text-white hover:text-[#b9f2d5] transition focus:outline-none focus:ring-2 focus:ring-white/60 rounded-full flex items-center justify-center"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="w-7 h-7"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </Container>

      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="absolute right-0 top-16 bg-white rounded-l-2xl shadow-2xl p-5 flex flex-col gap-3 w-[90vw] md:w-[400px] lg:w-[420px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[#10231a]">Menu</span>
              <button
                onClick={() => setMenuOpen(false)}
                className="text-sm text-primary-teal font-semibold focus:outline-none focus:ring-2 focus:ring-primary-teal/40 rounded"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1 pb-2 border-b border-[#e6f0eb]">
              <p className="text-[11px] uppercase tracking-[0.14em] text-[#4c5f68]">Our Programs</p>
              {programLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`font-medium block ${
                    isActive(item.href) ? 'text-primary-teal font-semibold' : 'text-primary-teal'
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="space-y-2 pb-2 border-b border-[#e6f0eb]">
              <p className="text-[11px] uppercase tracking-[0.14em] text-[#4c5f68]">Courses</p>
              <div className="grid grid-cols-2 gap-2">
                {courseLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`font-medium text-left whitespace-nowrap overflow-visible ${
                      isActive(item.href) ? 'text-primary-teal font-semibold' : 'text-primary-teal'
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            {secondaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`font-medium ${
                  isActive(item.href) ? 'text-primary-teal font-semibold' : 'text-primary-teal'
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
