import { apiGet } from '@/lib/api';
import BlogCard from '@/components/BlogCard';

export const metadata = {
  title: 'Blog – Annapurna Hospital',
  description: 'Health tips, hospital news, and articles from Annapurna Hospital.',
};

export default async function BlogListPage() {
  let posts = [];
  try {
    const res = await apiGet('/blogs?status=published');
    posts = res.data || [];
  } catch (err) {
    return <div className="p-6 text-red-600">Failed to load blog posts</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Blog</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {posts.map((p) => (
          <BlogCard key={p._id} post={p} />
        ))}
      </div>
    </div>
  );
}
