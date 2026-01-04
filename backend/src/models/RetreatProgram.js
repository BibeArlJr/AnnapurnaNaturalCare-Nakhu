const mongoose = require('mongoose');
const slugify = require('slugify');

const AccommodationSchema = new mongoose.Schema(
  {
    allowAccommodationChoice: { type: Boolean, default: false },
    options: [{ type: String, enum: ['hospital_premium', 'partner_hotel', 'own_arrangement'] }],
    hospitalPremiumPrice: { type: Number, min: 0 },
  },
  { _id: false }
);

const AccommodationPricingSchema = new mongoose.Schema(
  {
    key: { type: String, enum: ['hospital_premium', 'partner_hotel', 'own_arrangement'], required: true },
    label: { type: String, required: true },
    pricePerPersonUSD: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const RetreatProgramSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    descriptionShort: { type: String },
    descriptionLong: { type: String },
    programType: { type: String, enum: ['inside_valley', 'outside_valley'], required: true },
    durationDays: { type: Number },
    pricePerPersonUSD: { type: Number },
    accommodation: { type: AccommodationSchema, default: () => ({}) },
    destinations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RetreatDestination' }],
    included: [{ type: String }],
    alwaysIncludesAirportPickup: { type: Boolean, default: false },
    coverImage: { type: String },
    galleryImages: [{ type: String }],
    promoVideo: { type: String },
    accommodationPricing: [AccommodationPricingSchema],
    isActive: { type: Boolean, default: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
  },
  { timestamps: true }
);

RetreatProgramSchema.pre('validate', function (next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

RetreatProgramSchema.index({ slug: 1 }, { unique: true });

module.exports = mongoose.model('RetreatProgram', RetreatProgramSchema);
