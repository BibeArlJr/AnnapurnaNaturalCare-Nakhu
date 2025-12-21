"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function BlogCard({ blog }) {
  const image =
    blog.coverImage ||
    blog.mediaUrl ||
    (Array.isArray(blog.images) && blog.images.length ? blog.images[0] : null) ||
    blog.image ||
    '/placeholder.png';
  const excerpt = blog.shortDescription || blog.excerpt || '';
  const href = blog.slug ? `/blog/${blog.slug}` : '#';
  const hasImage = Boolean(image);

  return (
    <Link href={href} className="block h-full">
      <motion.article
        whileHover={{ y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
        className="h-full overflow-hidden rounded-2xl border border-[#cfe8d6] bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
      >
        <div className="h-44 w-full overflow-hidden bg-gradient-to-br from-[#e8f3ef] to-[#d5e9df]">
          {hasImage ? (
            <img
              src={image}
              alt={blog.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : null}
        </div>

        <div className="p-5 space-y-3">
          {(blog.categoryId?.name || blog.category) && (
            <p className="text-xs font-semibold uppercase tracking-wide text-[#2f7f5b]">
              {blog.categoryId?.name || blog.category}
            </p>
          )}
          <h3 className="text-lg font-semibold text-[#10231a] leading-snug">{blog.title}</h3>
          {excerpt && (
            <p className="text-sm text-[#5a695e] leading-relaxed line-clamp-3">{excerpt}</p>
          )}
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary-teal hover:underline">
            Read article →
          </span>
        </div>
      </motion.article>
    </Link>
  );
}
