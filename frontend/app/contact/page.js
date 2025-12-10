import ContactForm from '@/components/ContactForm';

export const metadata = {
  title: 'Contact Us – Annapurna Hospital',
  description: 'Get in touch with Annapurna Hospital for appointments and inquiries.',
};

export default function ContactPage() {
  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Contact Us</h1>
      <p className="text-gray-700">Have questions? Send us a message and we&apos;ll get back to you.</p>

      <ContactForm />
    </div>
  );
}
