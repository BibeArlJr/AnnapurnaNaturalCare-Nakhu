import Container from "@/components/Container";
import Link from "next/link";

export const metadata = {
  title: "Billing & Insurance | Annapurna Nature Cure Hospital",
  description: "Learn about billing, accepted payments, and insurance assistance at our hospital.",
};

export default function BillingInsurancePage() {
  return (
    <div className="min-h-screen bg-[#f5f8f4]">
      <Container className="py-14 md:py-18 space-y-10">
        <header className="space-y-3 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#10231a]">Billing &amp; Insurance</h1>
          <p className="text-base md:text-lg text-[#4c5f68] leading-relaxed">
            We keep billing transparent and help you understand payment options and insurance assistance,
            so you can focus on healing with peace of mind.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white border border-[#dfe8e2] rounded-2xl p-6 md:p-7 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold text-[#10231a]">Billing Process</h2>
            <p className="text-sm md:text-base text-[#4c5f68] leading-relaxed">
              After your consultation or treatment, we provide a clear summary of services and charges.
              Our team reviews costs with you and answers any questions before finalizing payment.
            </p>
          </section>

          <section className="bg-white border border-[#dfe8e2] rounded-2xl p-6 md:p-7 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold text-[#10231a]">Accepted Payment Methods</h2>
            <p className="text-sm md:text-base text-[#4c5f68] leading-relaxed">
              We accept multiple payment options to make checkout simple and convenient.
            </p>
            <ul className="list-disc list-inside text-sm text-[#4c5f68] space-y-1">
              <li>Cash and major credit/debit cards</li>
              <li>Digital payments (where available)</li>
              <li>Direct bank transfers</li>
            </ul>
          </section>

          <section className="bg-white border border-[#dfe8e2] rounded-2xl p-6 md:p-7 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold text-[#10231a]">Insurance Coverage</h2>
            <p className="text-sm md:text-base text-[#4c5f68] leading-relaxed">
              Coverage depends on your provider and plan. We can supply the necessary documents and guide you
              on how to coordinate with your insurer for pre-approvals where required.
            </p>
          </section>

          <section className="bg-white border border-[#dfe8e2] rounded-2xl p-6 md:p-7 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold text-[#10231a]">Claims &amp; Reimbursements</h2>
            <p className="text-sm md:text-base text-[#4c5f68] leading-relaxed">
              We help you gather bills, prescriptions, and reports needed for claims. Submit to your insurer,
              track the claim status, and contact us if you need any clarifications or duplicate documents.
            </p>
          </section>
        </div>

        <section className="bg-white border border-[#dfe8e2] rounded-2xl p-6 md:p-7 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-[#10231a]">Common Billing Questions</h2>
          <div className="space-y-3 text-sm md:text-base text-[#4c5f68]">
            <div>
              <p className="font-semibold text-[#10231a]">How will I receive my bill?</p>
              <p>We provide a printed summary and can also email a digital copy on request.</p>
            </div>
            <div>
              <p className="font-semibold text-[#10231a]">Can I get an estimate before treatment?</p>
              <p>Yes. Share your planned services, and we’ll provide an approximate cost breakdown.</p>
            </div>
            <div>
              <p className="font-semibold text-[#10231a]">Do you assist with insurance paperwork?</p>
              <p>We supply bills, prescriptions, and reports needed for your claim submission.</p>
            </div>
            <div>
              <p className="font-semibold text-[#10231a]">What if I have questions after payment?</p>
              <p>Reach out anytime—our billing team will clarify charges or provide duplicates.</p>
            </div>
          </div>
        </section>

        <section className="bg-white border border-[#dfe8e2] rounded-2xl p-6 md:p-7 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-[#10231a]">Need help with billing?</p>
            <p className="text-sm md:text-base text-[#4c5f68]">
              We’re here to answer questions about charges, payments, or insurance documents.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-[#2F8D59] px-5 py-2 text-sm font-semibold text-white hover:bg-[#27784c] transition"
            >
              Contact Us
            </Link>
            <Link
              href="/support/support-center"
              className="inline-flex items-center justify-center rounded-full border border-[#2F8D59] px-5 py-2 text-sm font-semibold text-[#2F8D59] hover:bg-[#e6f2ea] transition"
            >
              Support Center
            </Link>
          </div>
        </section>
      </Container>
    </div>
  );
}
