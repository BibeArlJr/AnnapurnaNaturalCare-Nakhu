import BlogHero from '@/components/blog/BlogHero';
import BlogGrid from '@/components/blog/BlogGrid';

export const metadata = {
  title: 'Health & Wellness Insights | Annapurna Nature Cure Hospital',
  description: 'Articles by our doctors and therapists on natural healing.',
};

export const revalidate = 0;

// Server component: no framer-motion imports here.
export default async function BlogPage() {
  let blogs = [];

  try {
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
    if (!baseUrl) throw new Error('API base URL not configured');

    const res = await fetch(`${baseUrl}/api/blogs`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Failed to fetch blogs (${res.status})`);
    }
    const data = await res.json();
    blogs = data?.data || data || [];
  } catch (err) {
    blogs = [];
  }

  return (
    <div className="bg-[#f5f8f4] min-h-screen">
      <BlogHero />

      <div className="max-w-6xl mx-auto px-6 pb-16 md:pb-20">
        <BlogGrid blogs={blogs} />
      </div>
    </div>
  );
}
