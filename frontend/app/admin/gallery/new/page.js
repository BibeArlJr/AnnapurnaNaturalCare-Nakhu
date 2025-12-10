import GalleryForm from '@/components/GalleryForm';

export default function NewGalleryPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Add Media</h1>
      <GalleryForm mode="create" />
    </div>
  );
}
