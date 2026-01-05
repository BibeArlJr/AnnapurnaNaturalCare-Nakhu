const mongoose = require('mongoose');

const HealthProgramBookingSchema = new mongoose.Schema(
  {
    programId: { type: mongoose.Schema.Types.ObjectId, ref: 'HealthProgram', required: true },
    programTitle: { type: String, required: true },
    userName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    country: { type: String },
    preferredStartDate: { type: Date },
    mode: { type: String, enum: ['online', 'residential', 'dayVisitor'], required: true },
    numberOfPeople: { type: Number, default: 1 },
    pricePerPerson: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'rescheduled'], default: 'pending' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    paymentGateway: { type: String, enum: ['stripe', 'cash', null], default: null },
    adminMessage: { type: String },
    notes: { type: String },
    unseen: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HealthProgramBooking', HealthProgramBookingSchema);
