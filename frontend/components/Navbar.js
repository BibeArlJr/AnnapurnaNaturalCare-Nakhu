'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Container from './Container';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { href: '/about', label: 'About Us' },
    { href: '/departments', label: 'Departments' },
    { href: '/doctors', label: 'Doctors' },
    { href: '/appointments', label: 'Appointments' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-primary-teal to-primary-dark shadow-md">
      <Container className="h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/images/logo.png" alt="Hospital Logo" width={48} height={48} className="rounded-md" />
          <span className="text-white text-xl font-semibold tracking-tight">
            Annapurna Nature Cure Hospital
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-white">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-primary-light transition">
              {item.label}
            </Link>
          ))}
        </div>

        <button
          className="md:hidden text-white text-2xl"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </Container>

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
        </div>
      )}
    </nav>
  );
}
