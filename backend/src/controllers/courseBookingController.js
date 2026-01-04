const mongoose = require('mongoose');
const Course = require('../models/Course');
const CourseBooking = require('../models/CourseBooking');
const Payment = require('../models/Payment');

exports.create = async (req, res) => {
  try {
    const {
      courseId,
      courseTitle,
      userName,
      email,
      phone,
      country,
      preferredStartDate,
      mode,
      numberOfPeople = 1,
      pricePerPerson,
      notes,
    } = req.body || {};

    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: 'Course is required' });
    }
    if (!userName || !email) return res.status(400).json({ success: false, message: 'Name and email are required' });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const people = Number(numberOfPeople) || 1;
    const price = Number(pricePerPerson ?? course.price) || 0;
    const subtotal = price * people;

    const booking = await CourseBooking.create({
      courseId,
      courseTitle: courseTitle || course.title,
      userName,
      email,
      phone,
      country,
      preferredStartDate: preferredStartDate ? new Date(preferredStartDate) : undefined,
      mode: mode || course.mode,
      numberOfPeople: people,
      pricePerPerson: price,
      subtotal,
      totalAmount: subtotal,
      notes,
      status: 'pending',
      paymentStatus: 'pending',
    });

    await Payment.findOneAndUpdate(
      { bookingId: booking._id, bookingType: 'course' },
      {
        bookingId: booking._id,
        bookingType: 'course',
        amount: subtotal,
        currency: 'USD',
        status: 'pending',
        gateway: 'manual',
        userName,
        userEmail: email,
        metadata: {
          courseTitle: booking.courseTitle,
          pricePerPerson: price,
          numberOfPeople: people,
          mode: booking.mode,
          totalPrice: subtotal,
        },
      },
      { upsert: true, new: true }
    );

    return res.status(201).json({ success: true, data: booking });
  } catch (err) {
    console.error('Course booking error:', err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.list = async (_req, res) => {
  try {
    const items = await CourseBooking.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body || {};
    const booking = await CourseBooking.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (status) booking.status = status;
    if (paymentStatus) booking.paymentStatus = paymentStatus;
    await booking.save();

    await Payment.findOneAndUpdate(
      { bookingId: booking._id, bookingType: 'course' },
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
    const booking = await CourseBooking.findById(id);
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
      { bookingId: booking._id, bookingType: 'course' },
      {
        status: booking.paymentStatus || 'pending',
        amount: booking.totalAmount || 0,
        userName: booking.userName,
        userEmail: booking.email,
        metadata: {
          courseTitle: booking.courseTitle,
          courseId: booking.courseId,
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
    console.error('Course booking update error:', err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await CourseBooking.findByIdAndDelete(id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    await Payment.deleteOne({ bookingId: id, bookingType: 'course' }).catch(() => {});
    return res.json({ success: true, data: booking });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
