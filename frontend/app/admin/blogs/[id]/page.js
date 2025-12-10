import { apiGet } from '@/lib/api';
import BlogForm from '@/components/BlogForm';

export default async function EditBlogPage({ params }) {
  const { id } = params;

  let blog = null;
  try {
    const res = await apiGet(`/blogs/${id}`);
    blog = res.data;
  } catch (err) {
    return <div className="text-red-600">Blog not found</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Blog</h1>
      <BlogForm mode="edit" initialData={blog} />
    </div>
  );
}
