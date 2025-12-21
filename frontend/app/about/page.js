import Container from '@/components/Container';
import {
  BuildingOfficeIcon,
  SparklesIcon,
  EyeIcon,
  HeartIcon,
  UserCircleIcon,
  GlobeAltIcon,
  CheckBadgeIcon,
  UserGroupIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/solid';

export const revalidate = 0;

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f5f8f4]">
      <Container className="py-12 md:py-16 space-y-12">
        <header className="space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-[#2F8D59] font-semibold">
            About Us
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold text-[#10231a]">
            About Annapurna Nature Cure Hospital
          </h1>
          <p className="text-base md:text-lg text-[#4c5f68] max-w-3xl mx-auto">
            We blend holistic, natural healing with modern clinical care to restore balance, vitality, and
            lifelong wellness for every patient.
          </p>
        </header>

        <section className="bg-white rounded-2xl shadow-sm border border-[#dfe8e2] p-6 md:p-10 space-y-6">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-[#10231a] flex items-center gap-2">
              <BuildingOfficeIcon className="h-6 w-6 text-[#2F8D59]" />
              Who We Are
            </h2>
            <p className="text-[#4c5f68] leading-relaxed">
              Annapurna Nature Cure Hospital is a multidisciplinary wellness center committed to naturopathy,
              Ayurveda, yoga therapy, physiotherapy, and preventive healthcare. Our team of experienced doctors,
              therapists, and caregivers work together to provide compassionate, patient-centered healing in a
              calm, nature-inspired environment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-[#10231a] flex items-center gap-2">
                <SparklesIcon className="h-5 w-5 text-[#2F8D59]" />
                Our Mission
              </h3>
              <p className="text-[#4c5f68] leading-relaxed">
                To promote holistic wellness through natural therapies, empowering individuals to prevent illness,
                recover sustainably, and cultivate healthy lifestyles.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-[#10231a] flex items-center gap-2">
                <EyeIcon className="h-5 w-5 text-[#2F8D59]" />
                Our Vision
              </h3>
              <p className="text-[#4c5f68] leading-relaxed">
                To be a trusted destination for integrative healing in Nepal, blending time-tested natural
                practices with attentive clinical care.
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Holistic Treatment',
              desc: 'Comprehensive plans across naturopathy, Ayurveda, yoga, and physiotherapy to support whole-person healing.',
              icon: HeartIcon,
            },
            {
              title: 'Personalized Care',
              desc: 'Every program is tailored to your goals, health history, and lifestyle to ensure sustainable results.',
              icon: UserCircleIcon,
            },
            {
              title: 'Nature-Based Therapies',
              desc: 'We harness natural remedies, mindful movement, and restorative environments to calm the body and mind.',
              icon: GlobeAltIcon,
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-2xl shadow-sm border border-[#dfe8e2] p-6 space-y-3"
            >
              <h3 className="text-lg font-semibold text-[#10231a] flex items-center gap-2">
                <item.icon className="h-5 w-5 text-[#2F8D59]" />
                {item.title}
              </h3>
              <p className="text-[#4c5f68] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-[#dfe8e2] p-6 md:p-10 space-y-6">
          <h2 className="text-2xl font-semibold text-[#10231a] flex items-center gap-2">
            <CheckBadgeIcon className="h-6 w-6 text-[#2F8D59]" />
            Why Choose Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Experienced Doctors',
                desc: 'Specialists across naturopathy, physiotherapy, Ayurveda, and yoga therapy with years of clinical practice.',
                icon: UserGroupIcon,
              },
              {
                title: 'Patient-Centered',
                desc: 'Care plans are crafted collaboratively, respecting your pace and preferences for healing.',
                icon: HeartIcon,
              },
              {
                title: 'Trusted Natural Treatments',
                desc: 'Evidence-informed therapies that emphasize safety, balance, and long-term wellbeing.',
                icon: ShieldCheckIcon,
              },
            ].map((item) => (
              <div key={item.title} className="space-y-2">
                <h3 className="text-lg font-semibold text-[#10231a] flex items-center gap-2">
                  <item.icon className="h-5 w-5 text-[#2F8D59]" />
                  {item.title}
                </h3>
                <p className="text-[#4c5f68] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-r from-[#e7f3ed] via-[#d7eadf] to-[#e7f3ed] rounded-2xl border border-[#cfe8d6] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-semibold text-[#10231a]">Ready to begin your healing journey?</h2>
            <p className="text-[#4c5f68]">
              Book an appointment or reach out to learn how our natural therapies can support your wellness.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="/appointments"
              className="px-6 py-3 rounded-full bg-[#2F8D59] text-white font-semibold hover:bg-[#27784c] transition text-center"
            >
              Book Appointment
            </a>
            <a
              href="/contact"
              className="px-6 py-3 rounded-full border border-[#2F8D59] text-[#2F8D59] font-semibold hover:bg-[#e6f2ea] transition text-center"
            >
              Contact Us
            </a>
          </div>
        </section>
      </Container>
    </div>
  );
}
