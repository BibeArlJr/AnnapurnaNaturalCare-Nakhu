const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    duration: { type: String },
    shortDescription: { type: String },
    longDescription: { type: String },
    included: [{ type: String }],
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    imageUrl: { type: String },
    imagePublicId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Package', PackageSchema);
