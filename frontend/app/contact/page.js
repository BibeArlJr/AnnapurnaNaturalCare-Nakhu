import ContactForm from "@/components/contact/ContactForm";
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from "@heroicons/react/24/outline";

export const metadata = {
  title: "Contact Us | Annapurna Nature Cure Hospital",
  description: "Reach out to schedule care, ask questions, or plan your healing visit.",
};

export default function ContactPage() {
  return (
    <div className="bg-[#f5f8f4] min-h-screen">
      <section className="bg-gradient-to-b from-white via-[#e6f2fb] to-[#f5f8f4]">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20 text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#10231a]">Contact Us</h1>
          <p className="text-base md:text-lg text-[#4c5f68]">
            We’re here to support your healing journey
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12">
          <div className="space-y-4">
            <p className="text-sm uppercase font-semibold text-[#2F8D59] tracking-wide">
              Annapurna Nature Cure Hospital
            </p>
            <h2 className="text-2xl font-semibold text-[#10231a]">We’re ready to help</h2>
            <div className="space-y-2 text-sm text-[#4c5f68]">
              <div className="flex items-start gap-3">
                <EnvelopeIcon className="h-5 w-5 text-[#2F8D59] mt-0.5" />
                <div>
                  <p className="font-medium text-[#10231a]">Email</p>
                  <a className="text-[#2F8D59] font-medium" href="mailto:bibekaryal717@gmail.com">
                    bibekaryal717@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <PhoneIcon className="h-5 w-5 text-[#2F8D59] mt-0.5" />
                <div>
                  <p className="font-medium text-[#10231a]">Phone</p>
                  <p>+977-9812345678</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPinIcon className="h-5 w-5 text-[#2F8D59] mt-0.5" />
                <div>
                  <p className="font-medium text-[#10231a]">Location</p>
                  <p>Kathmandu, Nepal</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-[#4c5f68] leading-relaxed pt-2">
              Share your questions, symptoms, or scheduling needs. Our team will get back to you with the next steps.
            </p>
          </div>

          <ContactForm />
        </div>
      </section>
    </div>
  );
}
