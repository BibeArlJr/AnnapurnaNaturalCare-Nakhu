const mongoose = require('mongoose');
const slugify = require('slugify');

const CourseCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

CourseCategorySchema.pre('validate', function (next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

CourseCategorySchema.index({ slug: 1 }, { unique: true });

module.exports = mongoose.model('CourseCategory', CourseCategorySchema);
