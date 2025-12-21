require('dotenv').config();
const connectDB = require('../config/db');
const Blog = require('../models/Blog');

function dedupe(list = []) {
  return [...new Set(list.filter(Boolean))];
}

async function migrate() {
  await connectDB();

  const blogs = await Blog.find();
  for (const blog of blogs) {
    const updates = {
      images: Array.isArray(blog.images) ? [...blog.images] : [],
      videos: Array.isArray(blog.videos) ? [...blog.videos] : [],
      youtubeLinks: Array.isArray(blog.youtubeLinks) ? [...blog.youtubeLinks] : [],
    };

    if (blog.type && blog.mediaUrl) {
      if (blog.type === 'image') updates.images.push(blog.mediaUrl);
      if (blog.type === 'video') updates.videos.push(blog.mediaUrl);
      if (blog.type === 'youtube') updates.youtubeLinks.push(blog.mediaUrl);
    }

    updates.images = dedupe(updates.images);
    updates.videos = dedupe(updates.videos);
    updates.youtubeLinks = dedupe(updates.youtubeLinks);

    await Blog.updateOne(
      { _id: blog._id },
      {
        $set: updates,
        $unset: { type: '', mediaUrl: '', coverImage: '' },
      }
    );
  }

  console.log('Blog media migration completed.');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
