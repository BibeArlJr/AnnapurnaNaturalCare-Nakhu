import Container from "@/components/Container";
import Link from "next/link";

export const metadata = {
  title: "Frequently Asked Questions | Annapurna Nature Cure Hospital",
  description: "Find answers to common questions about appointments, treatments, billing, and support.",
};

const FAQ_SECTIONS = [
  {
    title: "Appointments",
    items: [
      { q: "How do I book an appointment?", a: "You can book online through our appointments page or contact our support team for assistance." },
      { q: "Can I reschedule or cancel?", a: "Yes. Reach out to us, and we’ll help you reschedule or cancel based on availability and your plan." },
    ],
  },
  {
    title: "Treatments",
    items: [
      { q: "Do I need a referral?", a: "Referrals are not always required. We can guide you on the best next step based on your concern." },
      { q: "How long do treatments usually last?", a: "Treatment length depends on the program. We’ll share a clear schedule during your consultation." },
    ],
  },
  {
    title: "Billing & Insurance",
    items: [
      { q: "Do you accept insurance?", a: "Coverage depends on your plan. We provide documents to help you coordinate with your insurer." },
      { q: "When do I receive my bill?", a: "We share a clear summary after your consultation or treatment and can email a digital copy on request." },
    ],
  },
  {
    title: "General",
    items: [
      { q: "What should I bring on my first visit?", a: "Bring any medical reports, current medications, and a valid ID to help us prepare your care plan." },
      { q: "How can I contact support?", a: "Visit our Support Center or reach out via the Contact page for personalized assistance." },
    ],
  },
];

export default function FAQsPage() {
  return (
    <div className="min-h-screen bg-[#f5f8f4]">
      <Container className="py-14 md:py-18 space-y-10">
        <header className="space-y-3 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#10231a]">Frequently Asked Questions</h1>
          <p className="text-base md:text-lg text-[#4c5f68] leading-relaxed">
            Quick answers to common questions about appointments, treatments, billing, and general support.
          </p>
        </header>

        <div className="space-y-6">
          {FAQ_SECTIONS.map((section) => (
            <section key={section.title} className="bg-white border border-[#dfe8e2] rounded-2xl p-5 md:p-6 shadow-sm space-y-3">
              <h2 className="text-xl font-semibold text-[#10231a]">{section.title}</h2>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <div key={item.q} className="space-y-1">
                    <p className="text-sm md:text-base font-semibold text-[#10231a]">{item.q}</p>
                    <p className="text-sm md:text-base text-[#4c5f68] leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="bg-white border border-[#dfe8e2] rounded-2xl p-6 md:p-7 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-[#10231a]">Still have questions?</p>
            <p className="text-sm md:text-base text-[#4c5f68]">
              Explore more topics or reach out to our support team for personalized help.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link
              href="/support/support-center"
              className="inline-flex items-center justify-center rounded-full bg-[#2F8D59] px-5 py-2 text-sm font-semibold text-white hover:bg-[#27784c] transition"
            >
              Support Center
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border border-[#2F8D59] px-5 py-2 text-sm font-semibold text-[#2F8D59] hover:bg-[#e6f2ea] transition"
            >
              Contact Us
            </Link>
          </div>
        </section>
      </Container>
    </div>
  );
}
