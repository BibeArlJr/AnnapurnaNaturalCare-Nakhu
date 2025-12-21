"use client";

import { motion } from 'framer-motion';
import BlogCard from './BlogCard';

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

function SkeletonCard() {
  return (
    <div className="h-full overflow-hidden rounded-2xl border border-[#dfe8e2] bg-white shadow-sm">
      <div className="h-44 w-full bg-[#eef3f0]" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-20 bg-[#e6ece8] rounded-full" />
        <div className="h-4 w-3/4 bg-[#e6ece8] rounded-full" />
        <div className="h-4 w-full bg-[#e6ece8] rounded-full" />
        <div className="h-4 w-5/6 bg-[#e6ece8] rounded-full" />
      </div>
    </div>
  );
}

export default function BlogGrid({ blogs = [], loading = false }) {
  const showSkeletons = loading;
  const items = showSkeletons ? new Array(3).fill(null) : blogs;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {items.map((blog, index) =>
        showSkeletons ? (
          <SkeletonCard key={`skeleton-${index}`} />
        ) : (
          <motion.div
            key={blog._id || blog.id || blog.slug || index}
            variants={itemVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.05 * index }}
          >
            <BlogCard blog={blog} />
          </motion.div>
        )
      )}

      {!showSkeletons && blogs.length === 0 && (
        <div className="col-span-full text-center text-sm text-[#5a695e] bg-white/70 border border-[#dfe8e2] rounded-2xl py-10">
          Articles will appear here once published.
        </div>
      )}
    </div>
  );
}
