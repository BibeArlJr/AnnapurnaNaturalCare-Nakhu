import BlogForm from '@/components/BlogForm';

export default function NewBlogPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Add Blog</h1>
      <BlogForm mode="create" />
    </div>
  );
}
