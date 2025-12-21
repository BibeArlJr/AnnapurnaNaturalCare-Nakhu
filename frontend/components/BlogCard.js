export default function BlogCard({ post }) {
  const imageSrc = post.images?.[0];
  const videoSrc = post.videos?.[0];
  const youtubeSrc = post.youtubeLinks?.[0];
  const description = post.shortDescription || post.excerpt;

  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-md transition">
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={post.title}
          className="w-full h-48 object-cover rounded mb-3"
        />
      ) : videoSrc ? (
        <video src={videoSrc} controls className="w-full h-48 object-cover rounded mb-3" />
      ) : youtubeSrc ? (
        <div className="w-full h-48 rounded mb-3 overflow-hidden">
          <iframe
            src={youtubeSrc}
            className="w-full h-full rounded"
            title={post.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : null}

      <h2 className="text-xl font-semibold mb-2">{post.title}</h2>

      {description ? (
        <p className="text-gray-700 text-sm line-clamp-3 mb-2">{description}</p>
      ) : null}

      <a href={`/blog/${post.slug}`} className="text-blue-600 hover:underline">
        Read More →
      </a>
    </div>
  );
}
