const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    price: { type: Number, required: true },
    duration: { type: Number },
    durationDays: { type: Number },
    shortDescription: { type: String },
    longDescription: { type: String },
    included: [{ type: String }],
    // New single department reference (kept alongside legacy "departments" array for compatibility)
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    treatmentType: { type: mongoose.Schema.Types.ObjectId, ref: 'TreatmentType', required: true },
    departments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
    imageUrl: { type: String },
    imagePublicId: { type: String },
    galleryImages: [{ type: String }],
    promoVideos: [
      {
        type: { type: String, enum: ['file', 'url'], default: 'url' },
        url: { type: String, required: true },
        thumbnail: { type: String },
      },
    ],
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Package', PackageSchema);
