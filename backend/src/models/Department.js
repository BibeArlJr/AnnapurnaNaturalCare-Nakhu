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

const DepartmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    shortDescription: { type: String },
    description: { type: String },
    tagline: { type: String },
    services: [{ type: String }],
    heroImage: { type: String },
    image: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

DepartmentSchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = toSlug(this.name);
  }
  next();
});

DepartmentSchema.index({ slug: 1 });

module.exports = mongoose.model('Department', DepartmentSchema);
