const mongoose = require('mongoose');
const slugify = require('slugify');

const PricingSchema = new mongoose.Schema(
  {
    online: { type: Number, default: 0 },
    residential: { type: Number, default: 0 },
    dayVisitor: { type: Number, default: 0 },
  },
  { _id: false }
);

const HealthProgramSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    shortDescription: { type: String },
    longDescription: { type: String },
    durationInDays: { type: Number },
    modesAvailable: [{ type: String, enum: ['online', 'residential', 'dayVisitor'] }],
    pricing: { type: PricingSchema, default: () => ({}) },
    inclusions: [{ type: String }],
    outcomes: [{ type: String }],
    isPublished: { type: Boolean, default: false },
    coverImage: { type: String },
    galleryImages: [{ type: String }],
    promoVideos: [
      {
        type: { type: String, enum: ['file', 'url'], default: 'url' },
        url: { type: String, required: true },
        thumbnail: { type: String },
      },
    ],
    videoUrl: { type: String },
  },
  { timestamps: true }
);

HealthProgramSchema.pre('validate', function (next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

HealthProgramSchema.index({ slug: 1 }, { unique: true });

module.exports = mongoose.model('HealthProgram', HealthProgramSchema);
