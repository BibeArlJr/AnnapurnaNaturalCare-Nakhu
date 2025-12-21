import HomePageContent from "@/components/home/HomePageContent";

export const metadata = {
  title: "Annapurna Nature Cure Hospital – Holistic Healing in Kathmandu",
  description:
    "Annapurna Nature Cure Hospital offers naturopathy, yoga, Ayurveda, physiotherapy and lifestyle medicine in a calm, nature-focused environment in Kathmandu.",
};

export default async function HomePage() {
  return (
    <main className="min-h-screen bg-[#F4F8F3]">
      <HomePageContent />
    </main>
  );
}
