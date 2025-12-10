import { apiGet } from '@/lib/api';
import GalleryForm from '@/components/GalleryForm';

export default async function EditGalleryPage({ params }) {
  const { id } = params;

  let item = null;
  try {
    const res = await apiGet(`/gallery/${id}`);
    item = res.data;
  } catch (err) {
    return <div className="text-red-600">Media not found</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Media</h1>
      <GalleryForm mode="edit" initialData={item} />
    </div>
  );
}
