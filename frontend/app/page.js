import HomeSectionTitle from '@/components/HomeSectionTitle';
import ButtonPrimary from '@/components/ButtonPrimary';
import { apiGet } from '@/lib/api';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  BriefcaseIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

const HeroSearchBox = dynamic(() => import('@/components/HeroSearchBox'), { ssr: false });

export default async function HomePage() {
  const departmentsRes = await apiGet('/departments');
  const doctorsRes = await apiGet('/doctors');
  const packagesRes = await apiGet('/packages');
  const galleryRes = await apiGet('/gallery');
  const blogsRes = await apiGet('/blogs');

  const departments = departmentsRes?.data?.slice(0, 4) || [];
  const doctors = doctorsRes?.data?.slice(0, 3) || [];
  const packages = packagesRes?.data?.slice(0, 3) || [];
  const gallery = galleryRes?.data?.slice(0, 4) || [];
  const blogs = blogsRes?.data?.filter((b) => b.status === 'published').slice(0, 3) || [];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* HERO */}
      <section className="relative min-h-[82vh] flex flex-col justify-center pt-24 text-white">
        <img
          src="/images/Banner.jpg"
          alt="Hero Banner"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 flex flex-col items-center text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold">
            Your Path to Natural Healing Begins Here
          </h1>

          <p className="text-lg md:text-xl mt-4 max-w-3xl">
            Providing holistic health treatments, naturopathy care, and modern wellness therapies.
          </p>

          <div className="mt-6">
            <ButtonPrimary href="/appointments">Book an Appointment</ButtonPrimary>
          </div>
        </div>

      </section>

      <div className="relative z-20 w-full max-w-7xl mx-auto -mt-20 mb-16 px-6">
        <HeroSearchBox />
      </div>

      {/* QUICK ACCESS */}
      <section className="pt-2 pb-10 sm:pt-4 sm:pb-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-sm font-semibold tracking-wide uppercase text-teal-600">Quick access</p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">Find the care you need in seconds</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              href="/departments"
              className="group h-full rounded-2xl border border-slate-200 bg-white/80 px-5 py-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 mb-4">
                <BriefcaseIcon className="h-8 w-8 text-teal-700" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">Departments</h3>
              <p className="text-sm text-slate-600 mb-3">Explore all specialties and find the right department for your condition.</p>
              <span className="inline-flex items-center text-sm font-medium text-teal-700 group-hover:text-teal-800">
                View departments
                <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
              </span>
            </Link>

            <Link
              href="/doctors"
              className="group h-full rounded-2xl border border-slate-200 bg-white/80 px-5 py-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 mb-4">
                <UserGroupIcon className="h-8 w-8 text-teal-700" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">Our doctors</h3>
              <p className="text-sm text-slate-600 mb-3">Browse naturopathy, Ayurveda, physiotherapy and yoga experts.</p>
              <span className="inline-flex items-center text-sm font-medium text-teal-700 group-hover:text-teal-800">
                Meet the team
                <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
              </span>
            </Link>

            <Link
              href="/pack"
              className="group h-full rounded-2xl border border-slate-200 bg-white/80 px-5 py-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 mb-4">
                <ClipboardDocumentListIcon className="h-8 w-8 text-teal-700" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">Health packages</h3>
              <p className="text-sm text-slate-600 mb-3">Structured residential programs for detox, pain, lifestyle diseases and more.</p>
              <span className="inline-flex items-center text-sm font-medium text-teal-700 group-hover:text-teal-800">
                View packages
                <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
              </span>
            </Link>

            <Link
              href="/appointments"
              className="group h-full rounded-2xl border border-slate-200 bg-white/80 px-5 py-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 mb-4">
                <CalendarDaysIcon className="h-8 w-8 text-teal-700" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">Book appointment</h3>
              <p className="text-sm text-slate-600 mb-3">Choose a doctor, pick a date and confirm your slot in a few clicks.</p>
              <span className="inline-flex items-center text-sm font-medium text-teal-700 group-hover:text-teal-800">
                Book now
                <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* WHY PATIENTS CHOOSE US */}
      <section className="py-10 sm:py-14 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
            <div>
              <p className="text-sm font-semibold tracking-wide uppercase text-teal-600">Why patients choose Annapurna</p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">Nature-based healing backed by clinical care</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-600 max-w-md">
              We combine naturopathy, yoga, physiotherapy and lifestyle medicine to treat the root cause, not just the symptoms.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="rounded-2xl bg-slate-50 px-4 py-5 text-center shadow-sm">
              <p className="text-3xl font-extrabold tracking-tight text-teal-700">15+</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">Years of care</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-5 text-center shadow-sm">
              <p className="text-3xl font-extrabold tracking-tight text-teal-700">30+</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">Expert doctors</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-5 text-center shadow-sm">
              <p className="text-3xl font-extrabold tracking-tight text-teal-700">10k+</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">Patients cared for</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-5 text-center shadow-sm">
              <p className="text-3xl font-extrabold tracking-tight text-teal-700">4.8★</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">Avg. satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* CARE YOU CAN TRUST */}
      <section className="py-12 sm:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Care you can trust, in the heart of Kathmandu</h2>
          <p className="text-sm sm:text-base text-slate-600 mb-6">
            Whether you are managing chronic pain, lifestyle disorders or simply looking for a guided detox, our team is here to design a personalised program for you.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-full bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-teal-700 hover:shadow-lg"
          >
            Talk to our team
          </Link>
        </div>
      </section>

      {/* DEPARTMENTS */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <HomeSectionTitle
            title="Departments"
            subtitle="Explore specialized medical units with expert doctors and modern facilities."
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {departments.map((d) => (
              <a
                key={d._id}
                href={`/departments/${d.slug}`}
                className="bg-white p-6 rounded-lg shadow hover:shadow-xl hover:-translate-y-1 transition"
              >
                <div className="text-blue-600 text-3xl mb-3">🏥</div>
                <p className="font-semibold text-lg">{d.name}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* DOCTORS */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <HomeSectionTitle title="Our Doctors" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {doctors.map((doc) => (
              <a
                key={doc._id}
                href={`/doctors/${doc.slug}`}
                className="bg-white p-6 rounded-lg shadow hover:shadow-xl hover:-translate-y-1 transition"
              >
                {doc.photo ? (
                  <img
                    src={doc.photo}
                    alt={doc.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-lg mb-4" />
                )}

                <p className="font-semibold text-xl">{doc.name}</p>
                <p className="text-gray-600">{doc.title}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* PACKAGES */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <HomeSectionTitle title="Health Packages" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {packages.map((pkg) => (
              <a
                key={pkg._id}
                href={`/pack/${pkg.slug}`}
                className="bg-white p-6 rounded-lg shadow hover:shadow-xl hover:-translate-y-1 transition"
              >
                <p className="text-2xl font-bold mb-2">{pkg.title}</p>
                <p className="text-blue-600 font-semibold text-lg">{pkg.price ? `Rs. ${pkg.price}` : ''}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <HomeSectionTitle title="Gallery" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {gallery.map((g) => (
              <a
                key={g._id}
                href="/gallery"
                className="block rounded-lg overflow-hidden shadow hover:shadow-xl transition"
              >
                {g.type === 'image' ? (
                  <img
                    className="h-40 w-full object-cover hover:scale-105 transition-transform"
                    src={g.url}
                    alt={g.title || 'Gallery'}
                  />
                ) : (
                  <video
                    className="h-40 w-full object-cover hover:scale-105 transition-transform"
                    src={g.url}
                  />
                )}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* BLOGS */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <HomeSectionTitle title="Latest Articles" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {blogs.map((b) => (
              <a
                key={b._id}
                href={`/blog/${b.slug}`}
                className="bg-white p-6 rounded-lg shadow hover:shadow-xl hover:-translate-y-1 transition"
              >
                <p className="font-semibold text-xl mb-2">{b.title}</p>
                <p className="text-gray-600 text-sm">{b.excerpt}</p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
