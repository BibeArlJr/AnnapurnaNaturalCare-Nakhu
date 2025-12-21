import Container from "@/components/Container";
import MediaCarousel from "@/components/gallery/MediaCarousel";
import GalleryPreviewCard from "@/components/gallery/GalleryPreviewCard";
import { apiGet } from "@/lib/api";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { slug } = params;
  try {
    const res = await apiGet(`/gallery/${slug}`);
    const item = res?.data || res;
    if (!item) return {};
    return {
      title: item.title ? `${item.title} – Gallery – Annapurna Hospital` : "Gallery – Annapurna Hospital",
      description: item.description || "Gallery entry from Annapurna Nature Cure Hospital.",
    };
  } catch {
    return {
      title: "Gallery – Annapurna Nature Cure Hospital",
    };
  }
}

export const revalidate = 0;

export default async function GalleryDetailPage({ params }) {
  const { slug } = params;

  let item = null;
  let all = [];
  try {
    const res = await apiGet(`/gallery/${slug}`);
    item = res?.data || res;
  } catch (err) {
    console.error("Gallery detail load error:", err);
  }

  try {
    const allRes = await apiGet("/gallery");
    all = allRes?.data || allRes || [];
  } catch {
    all = [];
  }

  if (!item) {
    notFound();
  }

  const images = Array.isArray(item.images) ? item.images : [];
  const others = all.filter((g) => (g.slug || g._id) !== (item.slug || item._id)).slice(0, 4);

  return (
    <div className="bg-[#f5f8f4] min-h-screen">
      <Container className="py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-3 space-y-6">
            <MediaCarousel items={images} type="image" title={item.title} autoSlideInterval={4000} />

            <div className="bg-white border border-[#dfe8e2] rounded-2xl p-6 md:p-8 space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-[#2F8D59] font-semibold">Gallery</p>
              <h1 className="text-3xl md:text-4xl font-semibold text-[#10231a]">
                {item.title || "Gallery"}
              </h1>
              {item.category && (
                <p className="text-sm text-[#2F8D59] uppercase tracking-wide">{item.category}</p>
              )}
              {item.description && (
                <div
                  className="prose prose-green max-w-none text-[#10231a]"
                  dangerouslySetInnerHTML={{ __html: item.description }}
                />
              )}
            </div>
          </div>

          <aside className="lg:col-span-1 space-y-4">
            <div className="bg-white border border-[#dfe8e2] rounded-2xl p-4 space-y-3">
              <h3 className="text-lg font-semibold text-[#10231a]">More from Gallery</h3>
              {others.length === 0 && (
                <p className="text-sm text-[#4c5f68]">More entries coming soon.</p>
              )}
              <div className="space-y-3">
                {others.map((g) => (
                  <GalleryPreviewCard key={g._id} item={g} />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}
