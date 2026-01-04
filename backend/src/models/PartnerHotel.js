const mongoose = require('mongoose');

const PartnerHotelSchema = new mongoose.Schema(
  {
    location: { type: String, required: true, trim: true },
    starRating: { type: Number, enum: [3, 4, 5], required: true },
    pricePerNight: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

PartnerHotelSchema.index({ location: 1, starRating: 1 }, { unique: false });

module.exports = mongoose.model('PartnerHotel', PartnerHotelSchema);
