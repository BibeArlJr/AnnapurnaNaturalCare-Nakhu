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
    coverImage: { type: String },
    shortDescription: { type: String },
    body: { type: String },
    category: { type: String },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogCategory' },
    tags: [{ type: String }],
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
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
