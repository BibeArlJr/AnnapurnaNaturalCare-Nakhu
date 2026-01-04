"use client";

import Link from "next/link";
import Container from "./Container";
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowRightCircleIcon,
  BeakerIcon,
  LifebuoyIcon,
} from "@heroicons/react/24/solid";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-slate-900 text-gray-300 pt-10">

      <Container className="relative">

        {/* ============================
            ROW 1 — FOUR MAIN COLUMNS
        ============================ */}
        <div className="grid grid-cols-1 md:grid-cols-[300px_0.8fr_0.8fr_0.8fr] gap-10 pb-12 border-b border-slate-700">

          {/* ABOUT COLUMN */}
          <div className="space-y-4 text-center md:text-left w-full">

            {/* Logo */}
            <img
              src="/images/logo.png"
              alt="Logo"
              className="h-16 w-16 mx-auto md:mx-0 rounded-xl object-cover"
            />

            {/* Title + Subtitle */}
            <div className="space-y-1">
              <p className="text-white text-lg font-semibold leading-tight">
                Annapurna Nature Cure Hospital
              </p>

              <p className="text-gray-400 text-sm max-w-xs mx-auto md:mx-0">
                Holistic healing with naturopathy and wellness.
              </p>
            </div>

            {/* Underline */}
            <div className="h-1 w-10 bg-teal-500 rounded-full mx-auto md:mx-0" />

            {/* Social Icons */}
            <div className="flex gap-3 pt-1 justify-center md:justify-start">
              {["FB", "IG", "YT"].map((s) => (
                <div
                  key={s}
                  className="p-2 rounded-full bg-slate-800 hover:bg-teal-600 hover:text-white transition cursor-pointer text-sm font-semibold"
                >
                  {s}
                </div>
              ))}
            </div>

          </div>

          {/* QUICK LINKS */}
          <div className="space-y-3">
            <h3 className="font-semibold text-white flex items-center gap-2 text-base">
              <ArrowRightCircleIcon className="h-5 w-5 text-teal-400" />
              Quick Links
            </h3>
            <div className="h-1 w-10 bg-teal-500 rounded-full mt-1" />

            <ul className="space-y-2">
              <li><Link href="/doctors" className="hover:text-white">Our Doctors</Link></li>
              <li><Link href="/departments" className="hover:text-white">Departments</Link></li>
              <li><Link href="/pack" className="hover:text-white">Health Packages</Link></li>
              <li><Link href="/appointments" className="hover:text-white">Book Appointment</Link></li>
            </ul>
          </div>

          {/* SERVICES */}
          <div className="space-y-3">
            <h3 className="font-semibold text-white flex items-center gap-2 text-base">
              <BeakerIcon className="h-5 w-5 text-teal-400" />
              Our Services
            </h3>
            <div className="h-1 w-10 bg-teal-500 rounded-full mt-1" />

            <ul className="space-y-2">
              <li>Naturopathy</li>
              <li>Panchakarma</li>
              <li>Yoga Therapy</li>
              <li>Physiotherapy</li>
            </ul>
          </div>

          {/* PATIENT SUPPORT */}
          <div className="space-y-3">
            <h3 className="font-semibold text-white flex items-center gap-2 text-base">
              <LifebuoyIcon className="h-5 w-5 text-teal-400" />
              Patient Support
            </h3>
            <div className="h-1 w-10 bg-teal-500 rounded-full mt-1" />

            <ul className="space-y-2">
              <li>
                <Link href="/support/support-center" className="hover:text-white">
                  Support Center
                </Link>
              </li>
              <li>
                <Link href="/support/billing-insurance" className="hover:text-white">
                  Billing &amp; Insurance
                </Link>
              </li>
              <li>
                <Link href="/support/faqs" className="hover:text-white">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* ============================
            ROW 2 — MAP + NEWSLETTER + CONTACT
        ============================ */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-12">

          {/* MAP WITH ICON IN TITLE */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="font-semibold text-white flex items-center gap-2 text-base">
              <MapPinIcon className="h-5 w-5 text-teal-400" />
              Find Us
            </h3>

            <div className="h-1 w-10 bg-teal-500 rounded-full mt-1 mb-4 space-y-3" />

            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.421607770597!2d85.3217538745924!3d27.66696877620412!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb19caefbe6713%3A0xe57e7b73007f65f9!2sNakhu%2C%20Lalitpur!5e0!3m2!1sen!2snp!4v1700000000000!5m2!1sen!2snp"
              className="w-full h-64 rounded-xl shadow-lg border border-slate-700"
              loading="lazy"
            />
          </div>

          {/* NEWSLETTER */}
          <div className="bg-slate-800 p-6 rounded-xl shadow-md space-y-4">
            <h3 className="text-white text-lg font-semibold">Stay Updated</h3>
            <div className="h-1 w-10 bg-teal-500 rounded-full" />

            <p className="text-gray-300 text-sm">Subscribe for wellness tips and updates.</p>

            <input
              type="email"
              placeholder="Your email"
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:ring-2 focus:ring-teal-500 outline-none"
            />

            <button className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium">
              Subscribe
            </button>
          </div>

          {/* CONTACT */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2 text-base">
              <PhoneIcon className="h-5 w-5 text-teal-400" />
              Contact Us
            </h3>
            <div className="h-1 w-10 bg-teal-500 rounded-full" />

            <div className="flex items-start gap-3">
              <MapPinIcon className="h-5 w-5 text-teal-300" />
              <p>Nakhu, Lalitpur, Nepal</p>
            </div>

            <div className="flex items-start gap-3">
              <PhoneIcon className="h-5 w-5 text-teal-300" />
              <p>+977-1-4123456</p>
            </div>

            <div className="flex items-start gap-3">
              <EnvelopeIcon className="h-5 w-5 text-teal-300" />
              <p>info@annapurnahospital.com</p>
            </div>

            <div className="flex items-start gap-3">
              <ClockIcon className="h-5 w-5 text-teal-300" />
              <p>Sun–Fri: 7 AM – 7 PM</p>
            </div>
          </div>

        </div>

      </Container>

      {/* BOTTOM STRIP */}
      <div className="bg-slate-950 py-4 px-6">
        <Container className="flex flex-col sm:flex-row items-center justify-between text-sm text-slate-400">
          <p>© {year} Annapurna Nature Cure Hospital. All rights reserved.</p>

          <div className="flex items-center gap-4">
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms</Link>
            <Link href="/sitemap.xml">Sitemap</Link>
          </div>
        </Container>
      </div>

    </footer>
  );
}
