const mongoose = require('mongoose');

const CourseBookingSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    courseTitle: { type: String, required: true },
    userName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    country: { type: String },
    preferredStartDate: { type: Date },
    mode: { type: String },
    numberOfPeople: { type: Number, default: 1 },
    pricePerPerson: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'rescheduled'], default: 'pending' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    paymentGateway: { type: String, enum: ['stripe', 'cash', null], default: null },
    transactionId: { type: String },
    adminMessage: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CourseBooking', CourseBookingSchema);
