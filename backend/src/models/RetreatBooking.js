const mongoose = require('mongoose');

const RetreatBookingSchema = new mongoose.Schema(
  {
    programId: { type: mongoose.Schema.Types.ObjectId, ref: 'RetreatProgram', required: true },
    programTitle: { type: String, required: true },
    userName: { type: String, required: true },
    email: { type: String, required: true },
    country: { type: String },
    phone: { type: String },
    preferredStartDate: { type: Date },
    numberOfPeople: { type: Number, default: 1 },
    accommodationChoice: { type: String },
    accommodationLabel: { type: String },
    retreatPricePerPerson: { type: Number, default: 0 },
    accommodationPricePerPerson: { type: Number, default: 0 },
    retreatSubtotal: { type: Number, default: 0 },
    accommodationSubtotal: { type: Number, default: 0 },
    hotelMode: { type: String, enum: ['none', 'location', 'star', 'locationAndStar'], default: 'none' },
    hotelLocation: { type: String },
    hotelStarRating: { type: Number },
    hotelPricePerNight: { type: Number },
    hotelNights: { type: Number },
    hotelTotalCost: { type: Number },
    accommodationSelected: { type: Boolean, default: false },
    accommodationMode: { type: String, enum: ['none', 'location', 'star', 'locationAndStar'], default: 'none' },
    selectedLocation: { type: String },
    selectedStarRating: { type: Number },
    partnerHotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'PartnerHotel' },
    accommodationPricePerNight: { type: Number },
    accommodationNights: { type: Number },
    accommodationTotalCost: { type: Number },
    additionalNotes: { type: String },
    totalPriceUSD: { type: Number, default: 0 },
    totalAmountUSD: { type: Number, default: 0 },
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
      enum: ['pending', 'confirmed', 'cancelled', 'rescheduled', 'completed'],
      default: 'pending',
    },
    adminMessage: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

module.exports = mongoose.model('RetreatBooking', RetreatBookingSchema);
