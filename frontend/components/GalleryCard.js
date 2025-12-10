export default function GalleryCard({ item }) {
  return (
    <div className="border rounded-lg overflow-hidden shadow hover:shadow-md transition">
      {item.type === 'image' ? (
        <img
          src={item.url}
          alt={item.title || 'Gallery Image'}
          className="w-full h-56 object-cover"
        />
      ) : null}

      {item.type === 'video' ? (
        <video controls className="w-full h-56 object-cover">
          <source src={item.url} />
        </video>
      ) : null}

      <div className="p-4">
        {item.title ? <h2 className="text-lg font-semibold mb-2">{item.title}</h2> : null}
        {item.description ? <p className="text-gray-700 text-sm">{item.description}</p> : null}
      </div>
    </div>
  );
}
