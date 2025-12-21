const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema(
  {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    doctorName: { type: String },
    doctor: { type: String },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    departmentName: { type: String },
    service: { type: String },
    message: { type: String },
    patientName: { type: String },
    patientEmail: { type: String },
    patientPhone: { type: String },
    date: { type: String },
    time: { type: String },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rescheduled'],
      default: 'pending',
    },
    adminMessage: { type: String },
  },
  { timestamps: true }
);

AppointmentSchema.index({ doctorId: 1, date: 1 });

module.exports = mongoose.model('Appointment', AppointmentSchema);
