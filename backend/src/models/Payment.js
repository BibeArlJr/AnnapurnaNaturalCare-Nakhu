const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    bookingType: { type: String, enum: ['health', 'retreat', 'health_program', 'course'], required: true },
    gateway: { type: String, enum: ['stripe', 'manual'], default: 'manual' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    status: { type: String, enum: ['pending', 'paid', 'cancelled', 'refunded'], default: 'pending' },
    userName: { type: String },
    userEmail: { type: String },
    cancelledAt: { type: Date },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    metadata: { type: Object },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', PaymentSchema);
