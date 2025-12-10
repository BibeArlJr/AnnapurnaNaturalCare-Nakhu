import { apiGet } from '@/lib/api';
import GalleryCard from '@/components/GalleryCard';

export const metadata = {
  title: 'Gallery – Annapurna Hospital',
  description: 'Explore photos and videos from Annapurna Hospital.',
};

export default async function GalleryPage() {
  let items = [];

  try {
    const res = await apiGet('/gallery');
    items = res.data || [];
  } catch (err) {
    return <div className="p-6 text-red-600">Failed to load gallery</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Gallery</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <GalleryCard key={item._id} item={item} />
        ))}
      </div>
    </div>
  );
}
