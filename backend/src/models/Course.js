const mongoose = require('mongoose');
const slugify = require('slugify');

const SyllabusTopicSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true },
    items: [{ type: String, required: true }],
  },
  { _id: false }
);

const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseCategory' },
    overview: { type: String },
    detailedDescription: { type: String },
    description: { type: String }, // legacy
    duration: { type: String },
    certificationInfo: { type: String },
    mode: { type: String, enum: ['online', 'residential'], default: 'online' },
    syllabus: [SyllabusTopicSchema],
    price: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    coverImage: { type: String },
    galleryImages: [{ type: String }],
    promoVideos: [{ type: String }],
  },
  { timestamps: true }
);

CourseSchema.pre('validate', function (next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

CourseSchema.index({ slug: 1 }, { unique: true });

// Backwards compatibility: if syllabus is an array of strings, expose it as a single topic
CourseSchema.virtual('syllabusNormalized').get(function () {
  if (Array.isArray(this.syllabus) && this.syllabus.length) {
    // already structured?
    if (this.syllabus[0]?.topic || this.syllabus[0]?.items) return this.syllabus;
    // legacy string array
    return [{ topic: 'General', items: this.syllabus.filter((s) => typeof s === 'string' && s.trim()) }];
  }
  return [];
});

module.exports = mongoose.model('Course', CourseSchema);
