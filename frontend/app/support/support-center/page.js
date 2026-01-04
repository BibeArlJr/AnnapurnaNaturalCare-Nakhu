import Container from "@/components/Container";
import Link from "next/link";

export const metadata = {
  title: "Support Center | Annapurna Nature Cure Hospital",
  description:
    "Get help with appointments, billing, treatments, and general support at Annapurna Nature Cure Hospital.",
};

export default function SupportCenterPage() {
  return (
    <div className="min-h-screen bg-[#f5f8f4]">
      <Container className="py-14 md:py-18 space-y-10">
        <header className="space-y-3 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.18em] text-[#2F8D59] font-semibold">Support</p>
          <h1 className="text-3xl md:text-4xl font-semibold text-[#10231a]">Support Center</h1>
          <p className="text-base md:text-lg text-[#4c5f68] leading-relaxed">
            Welcome to our Support Center. We&apos;re here to help with appointments, billing, treatments,
            and general patient support so you can focus on healing with confidence.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white border border-[#dfe8e2] rounded-2xl p-6 md:p-7 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold text-[#10231a]">Patient Support</h2>
            <p className="text-sm md:text-base text-[#4c5f68] leading-relaxed">
              We support you before, during, and after treatment. Our team helps you understand your care plan,
              coordinate appointments, and stay informed about next steps for a smooth, reassuring experience.
            </p>
            <ul className="list-disc list-inside text-sm text-[#4c5f68] space-y-1">
              <li>Guidance before your visit</li>
              <li>On-site assistance during treatment</li>
              <li>Post-care follow-ups and support</li>
            </ul>
          </section>

          <section className="bg-white border border-[#dfe8e2] rounded-2xl p-6 md:p-7 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold text-[#10231a]">Appointment Assistance</h2>
            <p className="text-sm md:text-base text-[#4c5f68] leading-relaxed">
              Get help booking, rescheduling, or canceling appointments. We&apos;ll coordinate with doctors
              and therapists to find times that work best for you.
            </p>
            <ul className="list-disc list-inside text-sm text-[#4c5f68] space-y-1">
              <li>New appointment bookings</li>
              <li>Rescheduling or canceling visits</li>
              <li>Reminders and preparation tips</li>
            </ul>
          </section>

          <section className="bg-white border border-[#dfe8e2] rounded-2xl p-6 md:p-7 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold text-[#10231a]">Treatment &amp; Care Guidance</h2>
            <p className="text-sm md:text-base text-[#4c5f68] leading-relaxed">
              Our doctors, therapists, and nursing staff guide you through therapies, recovery steps, and
              day-to-day care so you always know what to expect.
            </p>
            <ul className="list-disc list-inside text-sm text-[#4c5f68] space-y-1">
              <li>Therapy schedules and expectations</li>
              <li>Recovery and self-care instructions</li>
              <li>Direct access to care teams for questions</li>
            </ul>
          </section>

          <section className="bg-white border border-[#dfe8e2] rounded-2xl p-6 md:p-7 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold text-[#10231a]">Emergency &amp; Urgent Help</h2>
            <p className="text-sm md:text-base text-[#4c5f68] leading-relaxed">
              If you have urgent concerns during your stay or while in a program, reach out to our team right away.
              We&apos;ll help you get the right level of care promptly.
            </p>
            <ul className="list-disc list-inside text-sm text-[#4c5f68] space-y-1">
              <li>On-site urgent assistance</li>
              <li>Guidance on next steps for urgent issues</li>
              <li>Coordination with your care team</li>
            </ul>
          </section>
        </div>

        <section className="bg-white border border-[#dfe8e2] rounded-2xl p-6 md:p-7 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-[#10231a]">Explore Help Topics</h2>
          <p className="text-sm md:text-base text-[#4c5f68]">
            Find quick answers and resources tailored to your needs.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="#"
              className="block rounded-xl border border-[#dfe8e2] bg-[#f9fbf8] px-4 py-3 text-[#10231a] hover:border-[#2F8D59] hover:shadow-sm transition"
            >
              Billing &amp; Insurance
            </Link>
            <Link
              href="#"
              className="block rounded-xl border border-[#dfe8e2] bg-[#f9fbf8] px-4 py-3 text-[#10231a] hover:border-[#2F8D59] hover:shadow-sm transition"
            >
              FAQs
            </Link>
            <Link
              href="/contact"
              className="block rounded-xl border border-[#dfe8e2] bg-[#f9fbf8] px-4 py-3 text-[#10231a] hover:border-[#2F8D59] hover:shadow-sm transition"
            >
              Contact Us
            </Link>
          </div>
        </section>
      </Container>
    </div>
  );
}
