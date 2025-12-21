import AppointmentHero from '@/components/appointments/AppointmentHero';
import AppointmentForm from '@/components/appointments/AppointmentForm';
import AppointmentInfo from '@/components/appointments/AppointmentInfo';

export const metadata = {
  title: 'Book an Appointment | Annapurna Nature Cure Hospital',
  description: 'Schedule your consultation with our doctors and therapists.',
};

export default function AppointmentsPage() {
  return (
    <div className="bg-[#f5f8f4] min-h-screen">
      <AppointmentHero />

      <AppointmentForm />
      <div className="max-w-5xl mx-auto px-6 pb-16 md:pb-20">
        <AppointmentInfo />
      </div>
    </div>
  );
}
