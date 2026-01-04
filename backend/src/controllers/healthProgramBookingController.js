const mongoose = require('mongoose');
const HealthProgramBooking = require('../models/HealthProgramBooking');
const HealthProgram = require('../models/HealthProgram');
const Payment = require('../models/Payment');
const { sendAppointmentEmail } = require('../utils/mailer'); // reuse email sender for now

exports.create = async (req, res) => {
  try {
    const {
      programId,
      programTitle,
      userName,
      email,
      phone,
      country,
      preferredStartDate,
      mode,
      numberOfPeople = 1,
      notes,
    } = req.body || {};

    if (!programId || !mongoose.Types.ObjectId.isValid(programId)) {
      return res.status(400).json({ success: false, message: 'Program is required' });
    }
    if (!userName || !email) return res.status(400).json({ success: false, message: 'Name and email are required' });
    if (!mode) return res.status(400).json({ success: false, message: 'Mode is required' });

    const program = await HealthProgram.findById(programId);
    if (!program) return res.status(404).json({ success: false, message: 'Program not found' });

    const priceForMode = Number(program.pricing?.[mode]) || 0;
    const people = Number(numberOfPeople) || 1;
    const subtotal = priceForMode * people;

    const booking = await HealthProgramBooking.create({
      programId,
      programTitle: programTitle || program.title,
      userName,
      email,
      phone,
      country,
      preferredStartDate: preferredStartDate ? new Date(preferredStartDate) : undefined,
      mode,
      numberOfPeople: people,
      pricePerPerson: priceForMode,
      subtotal,
      totalAmount: subtotal,
      notes,
      status: 'pending',
      paymentStatus: 'pending',
    });

    await Payment.findOneAndUpdate(
      { bookingId: booking._id, bookingType: 'health_program' },
      {
        bookingId: booking._id,
        bookingType: 'health_program',
        amount: subtotal,
        currency: 'USD',
        status: 'pending',
        gateway: 'manual',
        userName,
        userEmail: email,
        metadata: {
          programTitle: booking.programTitle,
          pricePerPerson: priceForMode,
          numberOfPeople: people,
          mode,
          totalPrice: subtotal,
        },
      },
      { upsert: true, new: true }
    );

    // Reuse appointment email for basic confirmation
    if (email) {
      await sendAppointmentEmail(email, {
        status: 'pending',
        service: booking.programTitle,
        date: booking.preferredStartDate,
        time: '',
        adminMessage: notes,
      }).catch(() => {});
    }

    return res.status(201).json({ success: true, data: booking });
  } catch (err) {
    console.error('Health program booking error:', err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.list = async (_req, res) => {
  try {
    const items = await HealthProgramBooking.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body || {};
    const booking = await HealthProgramBooking.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (status) booking.status = status;
    if (paymentStatus) booking.paymentStatus = paymentStatus;
    await booking.save();

    await Payment.findOneAndUpdate(
      { bookingId: booking._id, bookingType: 'health_program' },
      { status: paymentStatus || booking.paymentStatus || 'pending' },
      { upsert: true }
    );

    return res.json({ success: true, data: booking });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body || {};
    const booking = await HealthProgramBooking.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const fields = [
      'userName',
      'email',
      'phone',
      'country',
      'preferredStartDate',
      'mode',
      'numberOfPeople',
      'pricePerPerson',
      'notes',
      'status',
      'paymentStatus',
      'adminMessage',
    ];
    fields.forEach((key) => {
      if (payload[key] !== undefined) booking[key] = payload[key];
    });

    const people = Number(booking.numberOfPeople || 1) || 1;
    const price = Number(booking.pricePerPerson || 0);
    booking.subtotal = price * people;
    booking.totalAmount = booking.subtotal;

    await booking.save();

    await Payment.findOneAndUpdate(
      { bookingId: booking._id, bookingType: 'health_program' },
      {
        status: booking.paymentStatus || 'pending',
        amount: booking.totalAmount || 0,
        userName: booking.userName,
        userEmail: booking.email,
        metadata: {
          programTitle: booking.programTitle,
          programId: booking.programId,
          pricePerPerson: booking.pricePerPerson,
          numberOfPeople: booking.numberOfPeople,
          mode: booking.mode,
          totalPrice: booking.totalAmount,
        },
      },
      { upsert: true }
    );

    return res.json({ success: true, data: booking });
  } catch (err) {
    console.error('Health program booking update error:', err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await HealthProgramBooking.findByIdAndDelete(id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    await Payment.deleteOne({ bookingId: id, bookingType: 'health_program' }).catch(() => {});
    return res.json({ success: true, data: booking });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
