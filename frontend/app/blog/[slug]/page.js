import { apiGet } from '@/lib/api';

export async function generateMetadata({ params }) {
  try {
    const res = await apiGet(`/blogs/${params.slug}`);
    const post = res.data;
    return {
      title: `${post.title} – Annapurna Hospital`,
      description: post.excerpt || post.title,
    };
  } catch (error) {
    return {
      title: 'Blog – Annapurna Hospital',
      description: 'Articles from Annapurna Hospital.',
    };
  }
}

export default async function BlogDetail({ params }) {
  const { slug } = params;

  try {
    const res = await apiGet(`/blogs/${slug}`);
    const post = res.data;

    return (
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-64 object-cover rounded"
          />
        ) : null}

        <h1 className="text-4xl font-bold">{post.title}</h1>

        {post.tags?.length ? (
          <div className="flex gap-2">
            {post.tags.map((t, i) => (
              <span key={i} className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                {t}
              </span>
            ))}
          </div>
        ) : null}

        <article className="prose max-w-none">{post.body}</article>
      </div>
    );
  } catch (err) {
    return <div className="p-6 text-red-600">Blog post not found</div>;
  }
}
