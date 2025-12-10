'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { href: '/departments', label: 'Departments' },
    { href: '/doctors', label: 'Doctors' },
    { href: '/appointments', label: 'Appointments' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-primary-teal to-primary-dark shadow-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/images/logo.jpg" alt="Hospital Logo" width={48} height={48} className="rounded-md" />
          <span className="text-white text-xl font-semibold tracking-tight">
            Annapurna Nature Cure Hospital
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-white">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-primary-light transition">
              {item.label}
            </Link>
          ))}
          <Link
            href="/admin"
            className="bg-white text-primary-teal font-medium px-4 py-2 rounded-lg hover:bg-neutral-100 shadow-sm transition"
          >
            Admin Login
          </Link>
        </div>

        <button
          className="md:hidden text-white text-2xl"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden mt-3 bg-white rounded-lg shadow-md p-4 flex flex-col gap-3 mx-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-primary-teal font-medium"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/admin"
            className="text-primary-teal font-semibold"
            onClick={() => setMenuOpen(false)}
          >
            Admin Login
          </Link>
        </div>
      )}
    </nav>
  );
}
