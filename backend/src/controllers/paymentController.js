const mongoose = require('mongoose');
const PackageBooking = require('../models/PackageBooking');
const Package = require('../models/Package');
const Payment = require('../models/Payment');
const { sendPackageBookingEmail, sendRetreatBookingEmail } = require('../utils/mailer');
const RetreatBooking = require('../models/RetreatBooking');
const RetreatProgram = require('../models/RetreatProgram');
const HealthProgramBooking = require('../models/HealthProgramBooking');
const CourseBooking = require('../models/CourseBooking');

let stripeInstance = null;
function getStripe() {
  if (!stripeInstance) {
    console.log('Stripe key exists:', !!process.env.STRIPE_SECRET_KEY);
    stripeInstance = require('stripe')(process.env.STRIPE_SECRET_KEY || '');
  }
  return stripeInstance;
}

function fail(res, message = 'Server error', code = 400) {
  return res.status(code).json({ success: false, message });
}

async function computePackageTotal(bookingId) {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) return null;
  const booking = await PackageBooking.findById(bookingId);
  if (!booking) return null;
  let pricePer = booking.pricePerPerson || 0;
  if (!pricePer && booking.packageId && mongoose.Types.ObjectId.isValid(booking.packageId)) {
    const pkg = await Package.findById(booking.packageId);
    if (pkg?.price) pricePer = Number(pkg.price);
  }
  const people = Number(booking.peopleCount || booking.numberOfPersons || 1) || 1;
  const total = (Number(pricePer) || 0) * people;
  return { booking, totalUSD: total };
}

async function computeRetreatTotal(bookingId) {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) return null;
  const booking = await RetreatBooking.findById(bookingId);
  if (!booking) return null;
  const program = booking.programId ? await RetreatProgram.findById(booking.programId) : null;
  const retreatPrice =
    Number(booking.retreatPricePerPerson) ||
    (program?.pricePerPersonUSD ? Number(program.pricePerPersonUSD) : 0);
  const people = Number(booking.numberOfPeople || 1) || 1;

  const retreatSubtotal = retreatPrice * people;
  const accommodationSubtotal =
    booking.accommodationTotalCost !== undefined
      ? Number(booking.accommodationTotalCost) || 0
      : Number(booking.accommodationSubtotal) || 0;
  const totalUSD = retreatSubtotal + accommodationSubtotal;
  const accommodationLabel = booking.accommodationLabel;
  const accommodationPrice =
    booking.accommodationPricePerNight ||
    booking.hotelPricePerNight ||
    booking.accommodationPricePerPerson ||
    (program?.accommodation?.hospitalPremiumPrice && booking.accommodationChoice === 'hospital_premium'
      ? Number(program.accommodation.hospitalPremiumPrice)
      : 0);
  const metadata = {
    programId: booking.programId,
    programTitle: booking.programTitle,
    retreatPricePerPerson: retreatPrice,
    accommodationLabel,
    accommodationChoice: booking.accommodationChoice,
    accommodationPricePerPerson: accommodationPrice,
    accommodationPricePerNight: accommodationPrice,
    accommodationNights: booking.accommodationNights || booking.hotelNights,
    numberOfPeople: people,
    retreatSubtotal,
    accommodationSubtotal,
    totalPrice: totalUSD,
  };
  return { booking, totalUSD, retreatSubtotal, accommodationSubtotal, retreatPrice, accommodationPrice, metadata };
}

async function computeHealthProgramTotal(bookingId) {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) return null;
  const booking = await HealthProgramBooking.findById(bookingId);
  if (!booking) return null;
  const totalUSD = Number(booking.totalAmount || booking.totalAmountUSD || booking.subtotal || 0);
  return { booking, totalUSD };
}

async function computeCourseTotal(bookingId) {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) return null;
  const booking = await CourseBooking.findById(bookingId);
  if (!booking) return null;
  const people = Number(booking.numberOfPeople || 1) || 1;
  const unit = Number(booking.pricePerPerson || booking.price || 0);
  const totalUSD = unit * people;
  return {
    booking,
    totalUSD,
    metadata: {
      courseTitle: booking.courseTitle,
      courseId: booking.courseId,
      pricePerPerson: unit,
      numberOfPeople: people,
      mode: booking.mode,
    },
  };
}

exports.createStripeCheckout = async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe || !process.env.STRIPE_SECRET_KEY) return fail(res, 'Stripe not configured', 500);
    const { bookingId, type } = req.body || {};
    if (!bookingId || !type) return fail(res, 'bookingId and type are required');

    let bookingDoc = null;
    let totalUSD = 0;
    let description = '';
    let metadata = {};
    let bookingTypeForPayment = null;

    if (type === 'package') {
      const computed = await computePackageTotal(bookingId);
      if (!computed) return fail(res, 'Booking not found', 404);
      bookingDoc = computed.booking;
      totalUSD = computed.totalUSD;
      description = bookingDoc.packageName || 'Health package booking';
      bookingDoc.paymentGateway = 'stripe';
      await bookingDoc.save();
      bookingTypeForPayment = 'health';
    } else if (type === 'retreat') {
      const computed = await computeRetreatTotal(bookingId);
      if (!computed) return fail(res, 'Booking not found', 404);
      bookingDoc = computed.booking;
      totalUSD = computed.totalUSD;
      description = bookingDoc.programTitle || 'Retreat booking';
      bookingDoc.paymentGateway = 'stripe';
      await bookingDoc.save();
      bookingDoc._metadata = computed.metadata;
      metadata = computed.metadata || {};
      bookingTypeForPayment = 'retreat';
    } else if (type === 'health_program') {
      const computed = await computeHealthProgramTotal(bookingId);
      if (!computed) return fail(res, 'Booking not found', 404);
      bookingDoc = computed.booking;
      totalUSD = computed.totalUSD;
      description = bookingDoc.programTitle || 'Health program booking';
      bookingDoc.paymentGateway = 'stripe';
      await bookingDoc.save();
      bookingTypeForPayment = 'health_program';
      metadata = {
        programId: bookingDoc.programId,
        programTitle: bookingDoc.programTitle,
        pricePerPerson: bookingDoc.pricePerPerson,
        numberOfPeople: bookingDoc.numberOfPeople,
        mode: bookingDoc.mode,
        totalPrice: totalUSD,
      };
    } else if (type === 'course') {
      const computed = await computeCourseTotal(bookingId);
      if (!computed) return fail(res, 'Booking not found', 404);
      bookingDoc = computed.booking;
      totalUSD = computed.totalUSD;
      description = bookingDoc.courseTitle || 'Course booking';
      bookingDoc.paymentGateway = 'stripe';
      await bookingDoc.save();
      metadata = computed.metadata || {};
      bookingTypeForPayment = 'course';
    } else {
      return fail(res, 'Invalid type');
    }

    const amountCents = Math.round((Number(totalUSD) || 0) * 100);
    if (!amountCents || amountCents <= 0) {
      return fail(res, 'Invalid amount for checkout');
    }

    await Payment.findOneAndUpdate(
      { bookingId, bookingType: bookingTypeForPayment },
      {
        bookingId,
        bookingType: bookingTypeForPayment,
        gateway: 'stripe',
        amount: Number(totalUSD) || 0,
        currency: 'USD',
        status: 'pending',
        userName: bookingDoc.userName || bookingDoc.name,
        userEmail: bookingDoc.email,
        metadata: metadata || bookingDoc._metadata,
      },
      { upsert: true }
    );

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: amountCents,
            product_data: { name: description },
          },
        },
      ],
      success_url: `${process.env.FRONTEND_BASE_URL || 'http://localhost:3000'}/payment-success?booking=${bookingId}&type=${type}`,
      cancel_url: `${process.env.FRONTEND_BASE_URL || 'http://localhost:3000'}/payment-cancelled?booking=${bookingId}&type=${type}`,
    });

    return res.json({ success: true, url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return fail(res, err.message || 'Failed to create checkout session', 500);
  }
};

exports.markPaymentStatus = async (req, res) => {
  try {
    const { bookingId, type, status } = req.body || {};
    if (!bookingId || !type || !status) return fail(res, 'bookingId, type, status are required');
    const toPaid = status === 'paid';
    const toCancelled = status === 'cancelled';
    const toFailed = status === 'failed';
    const bookingType =
      type === 'package'
        ? 'health'
        : type === 'retreat'
        ? 'retreat'
        : type === 'health_program'
        ? 'health_program'
        : type === 'course'
        ? 'course'
        : null;
    if (!bookingType) return fail(res, 'Invalid type');

    if (type === 'package') {
      const booking = await PackageBooking.findById(bookingId);
      if (!booking) return fail(res, 'Booking not found', 404);
      booking.paymentStatus = status;
      if (toPaid) booking.status = 'confirmed';
      if (toPaid) booking.paymentGateway = 'stripe';
      if (toCancelled || toFailed) {
        booking.status = 'pending';
        if (!booking.paymentGateway) booking.paymentGateway = 'stripe';
      }
      await booking.save();
      await Payment.findOneAndUpdate(
        { bookingId, bookingType },
        {
          bookingId,
          bookingType,
          gateway: booking.paymentGateway || 'stripe',
          status,
          amount: booking.totalAmount || booking.totalAmountUSD || booking.totalPriceUSD || 0,
          currency: 'USD',
          userName: booking.userName || booking.name,
          userEmail: booking.email,
        },
        { upsert: true }
      );
      if (toPaid && booking.email) {
        await sendPackageBookingEmail(booking.email, {
          status: 'confirmed',
          packageName: booking.packageName,
          preferredStartDate: booking.preferredStartDate,
          peopleCount: booking.peopleCount,
          pricePerPerson: booking.pricePerPerson,
          totalAmount: booking.totalAmount,
        });
      }
      return res.json({ success: true, data: booking });
    }
    if (type === 'retreat') {
      const booking = await RetreatBooking.findById(bookingId);
      if (!booking) return fail(res, 'Booking not found', 404);
      booking.paymentStatus = status;
      if (toPaid) booking.status = 'confirmed';
      if (toPaid) booking.paymentGateway = 'stripe';
      if (toCancelled || toFailed) {
        booking.status = 'pending';
        if (!booking.paymentGateway) booking.paymentGateway = 'stripe';
      }
      await booking.save();
      const computed = await computeRetreatTotal(bookingId);
      const meta = computed?.metadata || { accommodationChoice: booking.accommodationChoice };
      await Payment.findOneAndUpdate(
        { bookingId, bookingType },
        {
          bookingId,
          bookingType,
          gateway: booking.paymentGateway || 'stripe',
          status,
          amount:
            booking.totalAmountUSD ||
            booking.totalPriceUSD ||
            (Number(booking.retreatSubtotal || 0) + Number(booking.accommodationSubtotal || 0)) ||
            0,
          currency: 'USD',
          userName: booking.userName,
          userEmail: booking.email,
          metadata: meta,
        },
        { upsert: true }
      );
      if (toPaid && booking.email) {
        await sendRetreatBookingEmail(booking.email, {
          status: 'confirmed',
          programTitle: booking.programTitle,
          preferredStartDate: booking.preferredStartDate,
          numberOfPeople: booking.numberOfPeople,
          totalAmountUSD: booking.totalAmountUSD,
        });
      }
      return res.json({ success: true, data: booking });
    }
    if (type === 'health_program') {
      const booking = await HealthProgramBooking.findById(bookingId);
      if (!booking) return fail(res, 'Booking not found', 404);
      booking.paymentStatus = status;
      if (toPaid) booking.status = 'confirmed';
      if (toPaid) booking.paymentGateway = 'stripe';
      if (toCancelled || toFailed) {
        booking.status = 'pending';
        if (!booking.paymentGateway) booking.paymentGateway = 'stripe';
      }
      await booking.save();
      await Payment.findOneAndUpdate(
        { bookingId, bookingType },
        {
          bookingId,
          bookingType,
          gateway: booking.paymentGateway || 'stripe',
          status,
          amount: booking.totalAmount || booking.totalAmountUSD || booking.subtotal || 0,
          currency: 'USD',
          userName: booking.userName,
          userEmail: booking.email,
          metadata: {
            programTitle: booking.programTitle,
            programId: booking.programId,
            pricePerPerson: booking.pricePerPerson,
            numberOfPeople: booking.numberOfPeople,
            mode: booking.mode,
            totalPrice: booking.totalAmount || booking.totalAmountUSD || booking.subtotal,
          },
        },
        { upsert: true }
      );
      return res.json({ success: true, data: booking });
    }
    if (type === 'course') {
      const booking = await CourseBooking.findById(bookingId);
      if (!booking) return fail(res, 'Booking not found', 404);
      booking.paymentStatus = status;
      if (toPaid) booking.status = 'confirmed';
      if (toPaid) booking.paymentGateway = 'stripe';
      if (toCancelled || toFailed) {
        booking.status = 'pending';
        if (!booking.paymentGateway) booking.paymentGateway = 'stripe';
      }
      await booking.save();
      await Payment.findOneAndUpdate(
        { bookingId, bookingType },
        {
          bookingId,
          bookingType,
          gateway: booking.paymentGateway || 'stripe',
          status,
          amount: booking.totalAmount || booking.subtotal || 0,
          currency: 'USD',
          userName: booking.userName,
          userEmail: booking.email,
          metadata: {
            courseTitle: booking.courseTitle,
            courseId: booking.courseId,
            pricePerPerson: booking.pricePerPerson,
            numberOfPeople: booking.numberOfPeople,
            mode: booking.mode,
            totalPrice: booking.totalAmount || booking.subtotal,
          },
        },
        { upsert: true }
      );
      return res.json({ success: true, data: booking });
    }
    return fail(res, 'Invalid type');
  } catch (err) {
    console.error('Mark payment status error:', err);
    return fail(res, err.message || 'Failed to update payment status', 500);
  }
};
