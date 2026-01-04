import Container from "@/components/Container";
import { apiGet } from "@/lib/api";
import GalleryGrid from "@/components/gallery/GalleryGrid";

export const metadata = {
  title: "Gallery – Annapurna Nature Cure Hospital",
  description: "Moments from therapies, retreats, and healing journeys.",
};

export const revalidate = 0;

export default async function GalleryPage() {
  let items = [];

  try {
    const res = await apiGet("/gallery");
    items = res?.data || res || [];
  } catch (err) {
    console.error("Gallery load error:", err);
  }

  return (
    <div className="bg-[#f5f8f4] min-h-screen">
      <Container className="py-12 md:py-16 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#10231a]">Gallery</h1>
          <p className="text-[#4c5f68] max-w-3xl">
            A calm glimpse into our therapies, spaces, and patient journeys at Annapurna Nature Cure Hospital.
          </p>
        </div>

        <GalleryGrid items={items} />
      </Container>
    </div>
  );
}
