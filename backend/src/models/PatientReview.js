const mongoose = require('mongoose');

const PatientReviewSchema = new mongoose.Schema(
  {
    slug: { type: String, unique: true, sparse: true },
    patientName: { type: String, required: true, trim: true },
    country: { type: String, trim: true },
    photo: { type: String },
    coverImage: { type: String },
    headline: { type: String, required: true },
    fullReview: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    associatedProgram: { type: String },
    associatedId: { type: String },
    associatedType: { type: String, enum: ['retreat', 'health'] },
    images: [
      {
        url: { type: String },
        caption: { type: String },
      },
    ],
    videoUrl: { type: String },
    videoCoverImage: { type: String },
    publishedAt: { type: Date },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
  },
  { timestamps: true }
);

PatientReviewSchema.pre('save', function (next) {
  if (!this.slug && this.headline) {
    this.slug = this.headline
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  next();
});

module.exports = mongoose.model('PatientReview', PatientReviewSchema);
