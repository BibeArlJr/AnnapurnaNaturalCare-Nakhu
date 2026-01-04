const mongoose = require('mongoose');

function toSlug(value) {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogCategory', required: false },
    category: {
      type: String,
      enum: ['Wellness', 'Therapy', 'Rehab', 'Lifestyle', 'Ayurveda', 'Yoga'],
      required: false,
    },
    coverImage: { type: String },
    author: { type: String },
    tags: { type: [String], default: [] },
    publishedAt: { type: Date },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    images: { type: [String], default: [] },
    videos: { type: [String], default: [] },
    youtubeLinks: { type: [String], default: [] },
    shortDescription: { type: String, default: '' },
    content: { type: String },
    createdAt: { type: Date },
  },
  { timestamps: true }
);

BlogSchema.pre('save', function (next) {
  if (!this.slug && this.title) {
    this.slug = toSlug(this.title);
  }
  next();
});

BlogSchema.index({ slug: 1 });
BlogSchema.index({ status: 1 });

module.exports = mongoose.model('Blog', BlogSchema);
