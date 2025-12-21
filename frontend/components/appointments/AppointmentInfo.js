export default function AppointmentInfo() {
  const items = [
    {
      title: 'Opening hours',
      body: 'Monday to Saturday, 7:00 AM – 6:00 PM. Limited Sunday slots for follow-ups.',
    },
    {
      title: 'Emergency contact',
      body: 'For urgent needs, call our front desk at +977-01-1234567. We will guide you immediately.',
    },
    {
      title: 'Confirmation',
      body: 'Our team will call you to confirm your appointment details and share any preparation steps.',
    },
  ];

  return (
    <section className="bg-[#ecf3ee] rounded-2xl border border-[#cfe8d6] p-6 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.title} className="space-y-2">
            <h3 className="text-lg font-semibold text-[#10231a]">{item.title}</h3>
            <p className="text-sm text-[#4c5f68] leading-relaxed">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
