"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  HomeIcon,
  Squares2X2Icon,
  UserGroupIcon,
  CalendarDaysIcon,
  NewspaperIcon,
  PhotoIcon,
  CubeIcon,
  ArrowRightOnRectangleIcon,
  GlobeAmericasIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import { apiGet } from '@/lib/api';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [unseenCounts, setUnseenCounts] = useState({
    retreatBookings: 0,
    healthPackages: 0,
    healthPrograms: 0,
    courses: 0,
  });

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: HomeIcon },
    { href: '/admin/departments', label: 'Departments', icon: Squares2X2Icon },
    { href: '/admin/doctors', label: 'Doctors', icon: UserGroupIcon },
    {
      label: 'Appointments',
      icon: CalendarDaysIcon,
      children: [
        { href: '/admin/appointments', label: 'General' },
        { href: '/admin/appointments/calendar', label: 'Calendar' },
      ],
    },
    { href: '/admin/blogs', label: 'Blog Articles', icon: NewspaperIcon },
    { href: '/admin/reviews', label: 'Patient Reviews', icon: NewspaperIcon },
    { href: '/admin/gallery', label: 'Gallery', icon: PhotoIcon },
    { href: '/admin/hero-images', label: 'Hero Banner Images', icon: PhotoIcon },
    {
      label: 'Health Packages',
      icon: CubeIcon,
      countKey: 'healthPackages',
      children: [
        { href: '/admin/packages', label: 'Manage Packages' },
        { href: '/admin/package-bookings', label: 'Package Bookings', countKey: 'healthPackages' },
        { href: '/admin/package-bookings/calendar', label: 'Calendar' },
        { href: '/admin/treatment-types', label: 'Treatment Types' },
      ],
    },
    {
      label: 'Retreat Program',
      icon: GlobeAmericasIcon,
      countKey: 'retreatBookings',
      children: [
        { href: '/admin/retreat-programs', label: 'Manage Programs' },
        { href: '/admin/retreat-destinations', label: 'Retreat Destinations' },
        { href: '/admin/retreat-partner-hotels', label: 'Partner Hotels' },
        { href: '/admin/retreat-bookings', label: 'Retreat Bookings', countKey: 'retreatBookings' },
      ],
    },
    {
      label: 'Health Programs',
      icon: CubeIcon,
      countKey: 'healthPrograms',
      children: [
        { href: '/admin/health-programs', label: 'Manage Programs' },
        { href: '/admin/health-program-bookings', label: 'Health Program Bookings', countKey: 'healthPrograms' },
      ],
    },
    {
      label: 'Courses',
      icon: Squares2X2Icon,
      countKey: 'courses',
      children: [
        { href: '/admin/courses', label: 'Manage Courses' },
        { href: '/admin/course-categories', label: 'Course Categories' },
        { href: '/admin/course-bookings', label: 'Course Bookings', countKey: 'courses' },
      ],
    },
    { href: '/admin/billing', label: 'Billing', icon: CurrencyDollarIcon },
  ];

  const isLoginPage = pathname === '/admin/login';

  // ⬅️ FIX: Hooks MUST come before any conditional return.
  const [openGroups, setOpenGroups] = useState(() => {
    const initial = {};
    navItems.forEach((item) => {
      if (item.children) {
        initial[item.label] = item.children.some((c) =>
          pathname.startsWith(c.href)
        );
      }
    });
    return initial;
  });

  function toggleGroup(label) {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  }

  function getPageLabel() {
    for (const item of navItems) {
      if (item.href && pathname.startsWith(item.href)) return item.label;
      if (item.children) {
        for (const child of item.children) {
          if (pathname.startsWith(child.href)) return child.label;
        }
      }
    }
    return 'Overview';
  }

  // Auth redirect effect (allowed to run before returns)
  useEffect(() => {
    if (loading) return;

    if (!isLoginPage && (!user || user.role !== 'admin')) {
      router.push('/admin/login');
    }
  }, [user, loading, isLoginPage, router]);

  useEffect(() => {
    async function loadCounts() {
      try {
        const res = await apiGet('/admin/unseen-counts');
        const data = res?.data || res || {};
        setUnseenCounts((prev) => ({ ...prev, ...data }));
      } catch (err) {
        // silent fail
      }
    }
    if (!isLoginPage) {
      loadCounts();
    }
  }, [isLoginPage]);

  useEffect(() => {
    const localMark = (key) => setUnseenCounts((prev) => ({ ...prev, [key]: 0 }));
    if (pathname.startsWith('/admin/retreat-bookings')) localMark('retreatBookings');
    if (pathname.startsWith('/admin/package-bookings')) localMark('healthPackages');
    if (pathname.startsWith('/admin/health-program-bookings')) localMark('healthPrograms');
    if (pathname.startsWith('/admin/course-bookings')) localMark('courses');
  }, [pathname]);

  // ⬅️ NOW safe because hooks already ran
  if (!isLoginPage && (loading || (!user && !loading))) {
    return <div className="p-6">Loading admin...</div>;
  }

  if (isLoginPage) {
    return children;
  }

  const itemClasses = (route) =>
    pathname === route
      ? 'bg-teal-600 text-white'
      : 'text-slate-300 hover:bg-slate-800';

  const renderBadge = (count) => {
    if (!count) return null;
    const display = count > 99 ? '99+' : count;
    return (
      <span className="absolute -top-2 -right-2 min-w-[20px] px-1.5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-semibold flex items-center justify-center shadow-lg transition-opacity">
        {display}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-slate-900 border-r border-slate-800">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Link href="/admin" className="flex items-center gap-2">
            <img
              src="/images/logo.png"
              alt="Logo"
              className="h-9 w-9 rounded-md object-cover"
            />
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight">Admin Panel</span>
              <span className="text-xs text-slate-400">Annapurna Nature Cure</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;

            if (item.children) {
              const expanded = openGroups[item.label];
              return (
                <div key={item.label} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleGroup(item.label)}
                    className={`relative w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm transition ${
                      expanded ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <span className="relative inline-block">
                        {item.label}
                        {renderBadge(item.countKey ? unseenCounts[item.countKey] : 0)}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {expanded ? '−' : '+'}
                    </span>
                  </button>

                  {expanded && (
                    <div className="pl-9 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${itemClasses(
                            child.href
                          )}`}
                        >
                          <span className="relative inline-block">
                            {child.label}
                            {renderBadge(child.countKey ? unseenCounts[child.countKey] : 0)}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${itemClasses(
                  item.href
                )}`}
              >
                <Icon className="h-5 w-5" />
                <span className="relative inline-block">
                  {item.label}
                  {renderBadge(item.countKey ? unseenCounts[item.countKey] : 0)}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <button
            type="button"
            onClick={logout}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-slate-800 bg-slate-900/80 backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Admin dashboard
            </p>
            <h1 className="text-sm md:text-base font-semibold text-slate-50">
              {getPageLabel()}
            </h1>
          </div>
          <div className="text-xs text-slate-300">
            {user?.email ? `Logged in as ${user.email}` : ''}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-950">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
