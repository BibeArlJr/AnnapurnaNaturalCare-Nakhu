const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    videos: {
      type: [String],
      default: [],
    },
    youtubeLinks: {
      type: [String],
      default: [],
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

GallerySchema.pre('save', function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

module.exports = mongoose.model('Gallery', GallerySchema);
