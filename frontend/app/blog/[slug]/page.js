import { apiGet } from '@/lib/api';
import MediaCarousel from '@/components/blog/MediaCarousel';
import Container from '@/components/Container';

export const revalidate = 0;

export async function generateMetadata({ params }) {
  try {
    const res = await apiGet(`/blogs/${params.slug}`);
    const post = res.data;
    return {
      title: `${post.title} – Annapurna Hospital`,
      description: post.shortDescription || post.excerpt || post.title,
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

    let related = [];
    try {
      const allRes = await apiGet('/blogs');
      const all = allRes?.data || allRes || [];
      related = all.filter((p) => p._id !== post._id).slice(0, 3);
    } catch (_) {
      related = [];
    }

    const content = post.content || post.body || '';
    let images = [...(post.images || [])];
    let videos = [...(post.videos || [])];
    let youtubeLinks = [...(post.youtubeLinks || [])];

    if (!images.length && post.mediaUrl && (post.type === 'image' || !post.type)) {
      images = [post.mediaUrl];
    }
    if (!videos.length && post.mediaUrl && post.type === 'video') {
      videos = [post.mediaUrl];
    }
    if (!youtubeLinks.length && post.mediaUrl && post.type === 'youtube') {
      youtubeLinks = [post.mediaUrl];
    }

    const extractYoutubeId = (url) => {
      const match = url?.match(
        /(?:youtube\.com\/(?:[^/]+\/.*|(?:v|embed)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\\s]{11})/
      );
      return match?.[1] || '';
    };

    return (
      <div className="min-h-screen bg-[#f5f8f4]">
        <Container className="py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <main className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl font-semibold text-[#10231a]">{post.title}</h1>
                {post.shortDescription ? (
                  <p className="text-base md:text-lg text-[#4c5f68]">{post.shortDescription}</p>
                ) : null}
              </div>

              <div className="w-full space-y-6">
                <MediaCarousel
                  media={[
                    ...images.map((src) => ({ type: 'image', src })),
                    ...videos.map((src) => ({ type: 'video', src })),
                    ...youtubeLinks.map((link) => {
                      const id = extractYoutubeId(link);
                      return { type: 'youtube', src: id ? `https://www.youtube.com/embed/${id}` : link };
                    }),
                  ]}
                />

                <article
                  className="prose prose-green max-w-none w-full text-neutral-800"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                  className={`block rounded-lg border border-[#dfe8e2] p-4 shadow-sm transition ${
                    related[0] ? 'hover:border-[#b7d0c2] hover:shadow' : 'opacity-50 cursor-not-allowed'
                  }`}
                  href={related[0]?.slug ? `/blog/${related[0].slug}` : undefined}
                  aria-disabled={!related[0]}
                >
                  <p className="text-sm font-semibold text-[#10231a]">
                    ← Previous Post
                  </p>
                  <p className="text-sm text-[#4c5f68] line-clamp-1">
                    {related[0]?.title || 'No previous post'}
                  </p>
                </a>
                <a
                  className={`block rounded-lg border border-[#dfe8e2] p-4 shadow-sm transition text-right ${
                    related[1] ? 'hover:border-[#b7d0c2] hover:shadow' : 'opacity-50 cursor-not-allowed'
                  }`}
                  href={related[1]?.slug ? `/blog/${related[1].slug}` : undefined}
                  aria-disabled={!related[1]}
                >
                  <p className="text-sm font-semibold text-[#10231a]">
                    Next Post →
                  </p>
                  <p className="text-sm text-[#4c5f68] line-clamp-1">
                    {related[1]?.title || 'No next post'}
                  </p>
                </a>
              </div>
            </main>

            <aside className="lg:col-span-1 space-y-6 lg:border-l lg:border-emerald-100 lg:pl-6">
              <div className="bg-white rounded-xl border border-[#cfe8d6] shadow-sm p-5">
                <h3 className="text-lg font-semibold text-[#10231a] mb-3">Related Posts</h3>
                <div className="space-y-3">
                  {related.map((item) => (
                    <a
                      key={item._id}
                      href={`/blog/${item.slug}`}
                      className="block rounded-lg border border-[#dfe8e2] hover:border-[#b7d0c2] hover:shadow-sm transition p-3"
                    >
                      <p className="text-sm font-semibold text-[#10231a] line-clamp-2">{item.title}</p>
                      {item.shortDescription ? (
                        <p className="text-xs text-[#5a695e] mt-1 line-clamp-2">{item.shortDescription}</p>
                      ) : null}
                    </a>
                  ))}
                  {related.length === 0 && (
                    <p className="text-sm text-[#5a695e]">More articles coming soon.</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#cfe8d6] shadow-sm p-5">
                <h3 className="text-lg font-semibold text-[#10231a] mb-3">Need to consult?</h3>
                <p className="text-sm text-[#4c5f68] mb-4">
                  Book an appointment or contact us for personalized guidance.
                </p>
                <div className="space-y-2">
                  <a
                    href="/appointments"
                    className="block text-center bg-[#2F8D59] hover:bg-[#27784c] text-white font-semibold py-2 rounded-lg transition"
                  >
                    Book Appointment
                  </a>
                  <a
                    href="/contact"
                    className="block text-center border border-[#2F8D59] text-[#2F8D59] font-semibold py-2 rounded-lg transition hover:bg-[#e6f2ea]"
                  >
                    Contact Us
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </div>
    );
  } catch (err) {
    return <div className="p-6 text-red-600">Blog post not found</div>;
  }
}
