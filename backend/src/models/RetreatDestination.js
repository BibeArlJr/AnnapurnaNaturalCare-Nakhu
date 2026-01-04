const mongoose = require('mongoose');

const RetreatDestinationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['inside_valley', 'outside_valley'], required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

RetreatDestinationSchema.index({ name: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('RetreatDestination', RetreatDestinationSchema);
