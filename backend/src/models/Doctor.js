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

const ScheduleSchema = new mongoose.Schema(
  {
    day: { type: String },
    slots: [{ type: String }],
  },
  { _id: false }
);

const DoctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    email: { type: String },
    phone: { type: String },
    specialties: [{ type: String }],
    experienceYears: { type: Number, default: 0 },
    bio: { type: String },
    photo: { type: String },
    schedule: [ScheduleSchema],
  },
  { timestamps: true }
);

DoctorSchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = toSlug(this.name);
  }
  next();
});

DoctorSchema.index({ slug: 1 });
DoctorSchema.index({ departmentId: 1 });

module.exports = mongoose.model('Doctor', DoctorSchema);
