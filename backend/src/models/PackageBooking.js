const mongoose = require('mongoose');

const PackageBookingSchema = new mongoose.Schema(
  {
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
    packageName: { type: String },
    userName: { type: String, required: true, trim: true },
    name: { type: String, trim: true }, // legacy compatibility
    email: { type: String, trim: true },
    phone: { type: String, required: true, trim: true },
    preferredStartDate: { type: String },
    peopleCount: { type: Number, default: 1 },
    numberOfPersons: { type: Number, default: 1 },
    pricePerPerson: { type: Number },
    totalAmount: { type: Number },
    accommodationSelected: { type: Boolean, default: false },
    accommodationMode: { type: String, enum: ['none', 'location', 'star', 'locationAndStar'], default: 'none' },
    selectedLocation: { type: String },
    selectedStarRating: { type: Number },
    partnerHotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'PartnerHotel' },
    accommodationPricePerNight: { type: Number },
    accommodationNights: { type: Number },
    accommodationTotalCost: { type: Number },
    notes: { type: String },
    internalNotes: { type: String },
    createdBy: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    source: {
      type: String,
      enum: ['online', 'phone', 'walkin', 'whatsapp', 'Phone Call', 'Walk-in', 'WhatsApp', 'Other'],
      default: 'online',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'cancelled'],
      default: 'pending',
    },
    paymentGateway: {
      type: String,
      enum: ['stripe', 'cash', null],
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rescheduled'],
      default: 'pending',
    },
    adminMessage: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PackageBooking', PackageBookingSchema);
