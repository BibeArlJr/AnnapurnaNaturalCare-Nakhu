import Container from "@/components/Container";
import { apiGet } from "@/lib/api";
import GalleryPreviewCard from "@/components/gallery/GalleryPreviewCard";

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

        {(!items || items.length === 0) && (
          <div className="bg-white border border-[#dfe8e2] rounded-2xl p-8 text-center text-[#4c5f68]">
            No gallery items yet. Please check back soon.
          </div>
        )}

        {items && items.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {items.map((item) => (
              <GalleryPreviewCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
