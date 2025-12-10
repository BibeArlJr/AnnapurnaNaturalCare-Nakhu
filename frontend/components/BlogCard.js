export default function BlogCard({ post }) {
  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-md transition">
      {post.coverImage ? (
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-48 object-cover rounded mb-3"
        />
      ) : null}

      <h2 className="text-xl font-semibold mb-2">{post.title}</h2>

      {post.excerpt ? (
        <p className="text-gray-700 text-sm line-clamp-3 mb-2">{post.excerpt}</p>
      ) : null}

      <a href={`/blog/${post.slug}`} className="text-blue-600 hover:underline">
        Read More →
      </a>
    </div>
  );
}
