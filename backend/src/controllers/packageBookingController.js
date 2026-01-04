const mongoose = require('mongoose');
const PackageBooking = require('../models/PackageBooking');
const Payment = require('../models/Payment');
const Package = require('../models/Package');
const PartnerHotel = require('../models/PartnerHotel');
const { sendAppointmentEmail, sendPackageBookingEmail } = require('../utils/mailer');

function buildPayload(body) {
  const payload = {
    packageId: body.packageId,
    packageName: body.packageName,
    userName: body.userName || body.name,
    email: body.email,
    phone: body.phone,
    preferredStartDate: body.preferredStartDate,
    peopleCount: body.peopleCount || body.people,
    numberOfPersons: body.numberOfPersons || body.peopleCount || body.people,
    pricePerPerson: body.pricePerPerson,
    totalAmount: body.totalAmount,
    notes: body.notes,
    source: body.source,
    internalNotes: body.internalNotes,
    status: body.status,
    notifyCustomer: body.notifyCustomer,
    accommodationSelected: body.accommodationSelected,
    accommodationMode: body.accommodationMode,
    selectedLocation: body.selectedLocation,
    selectedStarRating: body.selectedStarRating,
    partnerHotelId: body.partnerHotelId,
    accommodationPricePerNight: body.accommodationPricePerNight,
    accommodationNights: body.accommodationNights,
    accommodationTotalCost: body.accommodationTotalCost,
    paymentStatus: body.paymentStatus,
    adminMessage: body.adminMessage,
  };
  return payload;
}

async function resolveAccommodationForPackage(payload = {}, pkgDoc) {
  const {
    accommodationMode = 'none',
    selectedLocation,
    selectedStarRating,
    partnerHotelId,
    accommodationPricePerNight,
    accommodationNights,
  } = payload;

  const durationDays = pkgDoc?.duration || pkgDoc?.durationDays || 0;

  if (accommodationMode === 'none') {
    return {
      accommodationSelected: false,
      accommodationMode: 'none',
      selectedLocation: null,
      selectedStarRating: null,
      partnerHotelId: null,
      accommodationPricePerNight: 0,
      accommodationNights: durationDays || 0,
      accommodationTotalCost: 0,
    };
  }

  let option = null;
  if (partnerHotelId && mongoose.Types.ObjectId.isValid(partnerHotelId)) {
    option = await PartnerHotel.findOne({ _id: partnerHotelId, isActive: true });
  } else {
    const query = { isActive: true };
    if (['location', 'locationAndStar'].includes(accommodationMode) && selectedLocation) {
      query.location = selectedLocation;
    }
    if (['star', 'locationAndStar'].includes(accommodationMode) && selectedStarRating) {
      query.starRating = selectedStarRating;
    }
    option = await PartnerHotel.findOne(query);
  }

  if (!option) {
    return {
      accommodationSelected: false,
      accommodationMode: 'none',
      selectedLocation: null,
      selectedStarRating: null,
      partnerHotelId: null,
      accommodationPricePerNight: 0,
      accommodationNights: durationDays || 0,
      accommodationTotalCost: 0,
    };
  }

  const nights = accommodationNights || durationDays || 1;
  const pricePerNight = accommodationPricePerNight ?? option.pricePerNight ?? 0;
  const total = Number(pricePerNight) * Number(nights);

  return {
    accommodationSelected: true,
    accommodationMode,
    selectedLocation: option.location || selectedLocation || null,
    selectedStarRating: option.starRating || selectedStarRating || null,
    partnerHotelId: option._id,
    accommodationPricePerNight: Number(pricePerNight),
    accommodationNights: Number(nights),
    accommodationTotalCost: total,
  };
}

async function upsertPaymentForPackage(booking, status, gateway = 'manual') {
  if (!booking?._id) return;
  const amount = booking.totalAmount || booking.totalAmountUSD || booking.totalPriceUSD || 0;
  await Payment.findOneAndUpdate(
    { bookingId: booking._id, bookingType: 'health' },
    {
      bookingId: booking._id,
      bookingType: 'health',
      gateway,
      amount,
      currency: 'USD',
      status,
      userName: booking.userName || booking.name,
      userEmail: booking.email,
      metadata: { packageId: booking.packageId },
    },
    { upsert: true, new: true }
  );
}

exports.create = async (req, res) => {
  try {
    const {
      packageId,
      packageName,
      userName,
      phone,
      email,
      preferredStartDate,
      peopleCount,
      numberOfPersons,
      pricePerPerson,
      totalAmount,
      notes,
      source,
      status,
      notifyCustomer,
      internalNotes,
      accommodationMode = 'none',
      selectedLocation,
      selectedStarRating,
      partnerHotelId,
      accommodationPricePerNight,
      accommodationNights,
    } = buildPayload(req.body);

    if (!userName || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone are required' });
    }

    let resolvedPackageName = packageName;
    let pkgDoc = null;
    if (packageId && mongoose.Types.ObjectId.isValid(packageId)) {
      pkgDoc = await Package.findById(packageId);
      if (!pkgDoc) {
        return res.status(404).json({ success: false, message: 'Package not found' });
      }
      resolvedPackageName = pkgDoc.name;
    }

    const persons = Number(numberOfPersons || peopleCount || 1);
    if (!Number.isFinite(persons) || persons < 1) {
      return res.status(400).json({ success: false, message: 'Number of persons must be at least 1' });
    }

    let priceToUse = pricePerPerson ? Number(pricePerPerson) : undefined;
    if (!priceToUse || !Number.isFinite(priceToUse) || priceToUse <= 0) {
      const pkgPrice = pkgDoc?.price && Number(pkgDoc.price) > 0 ? Number(pkgDoc.price) : null;
      if (pkgPrice) priceToUse = pkgPrice;
    }
    if (!priceToUse) {
      return res.status(400).json({ success: false, message: 'Price per person is required' });
    }

    const accommodation = await resolveAccommodationForPackage(
      {
        accommodationMode,
        selectedLocation,
        selectedStarRating,
        partnerHotelId,
        accommodationPricePerNight,
        accommodationNights,
      },
      pkgDoc
    );

    const baseTotal = priceToUse * persons;
    const computedTotal = baseTotal + (accommodation?.accommodationTotalCost || 0);
    if (totalAmount && Number(totalAmount) !== computedTotal) {
      return res
        .status(400)
        .json({ success: false, message: 'Total amount mismatch. Please refresh and try again.' });
    }

    const allowedStatus = ['pending', 'confirmed', 'cancelled', 'completed', 'rescheduled'];
    const initialStatus = status && allowedStatus.includes(status) ? status : 'pending';

    const booking = await PackageBooking.create({
      packageId: packageId && mongoose.Types.ObjectId.isValid(packageId) ? packageId : undefined,
      packageName: resolvedPackageName,
      userName,
      phone,
      email,
      preferredStartDate,
      peopleCount: persons,
      numberOfPersons: persons,
      pricePerPerson: priceToUse,
      totalAmount: computedTotal,
      notes,
      source,
      internalNotes,
      status: initialStatus,
      createdBy: 'user',
      accommodationSelected: accommodation.accommodationSelected,
      accommodationMode: accommodation.accommodationMode,
      selectedLocation: accommodation.selectedLocation,
      selectedStarRating: accommodation.selectedStarRating,
      partnerHotelId: accommodation.partnerHotelId,
      accommodationPricePerNight: accommodation.accommodationPricePerNight,
      accommodationNights: accommodation.accommodationNights,
      accommodationTotalCost: accommodation.accommodationTotalCost,
    });

    await upsertPaymentForPackage(booking, 'pending', 'manual');

    // User-created bookings: always acknowledge if email present
    if (email) {
      try {
        await sendPackageBookingEmail(email, {
          template: 'created',
          status: initialStatus,
          packageName: resolvedPackageName,
          date: preferredStartDate,
        peopleCount: persons,
        pricePerPerson: priceToUse,
        totalAmount: computedTotal,
        duration: pkgDoc?.duration,
        notes,
        accommodationMode: accommodation.accommodationMode,
        selectedLocation: accommodation.selectedLocation,
        selectedStarRating: accommodation.selectedStarRating,
        accommodationPricePerNight: accommodation.accommodationPricePerNight,
        accommodationNights: accommodation.accommodationNights,
        accommodationTotalCost: accommodation.accommodationTotalCost,
      });
      } catch (mailErr) {
        console.error('Package booking email send failed:', mailErr?.message || mailErr);
      }
    }

    return res.status(201).json({ success: true, data: booking });
  } catch (error) {
    console.error('Package booking create error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getAll = async (_req, res) => {
  try {
    const items = await PackageBooking.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const {
      packageId,
      packageName,
      userName,
      phone,
      email,
      preferredStartDate,
      peopleCount,
      numberOfPersons,
      pricePerPerson,
      totalAmount,
      notes,
      source,
      status,
      notifyCustomer,
      internalNotes,
      accommodationMode = 'none',
      selectedLocation,
      selectedStarRating,
      partnerHotelId,
      accommodationPricePerNight,
      accommodationNights,
    } = buildPayload(req.body);

    if (!userName || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone are required' });
    }

    let resolvedPackageName = packageName;
    let pkgDoc = null;
    if (packageId && mongoose.Types.ObjectId.isValid(packageId)) {
      pkgDoc = await Package.findById(packageId);
      if (!pkgDoc) {
        return res.status(404).json({ success: false, message: 'Package not found' });
      }
      resolvedPackageName = pkgDoc.name;
    }

    const persons = Number(numberOfPersons || peopleCount || 1);
    if (!Number.isFinite(persons) || persons < 1) {
      return res.status(400).json({ success: false, message: 'Number of persons must be at least 1' });
    }

    let priceToUse = pricePerPerson ? Number(pricePerPerson) : undefined;
    if (!priceToUse || !Number.isFinite(priceToUse) || priceToUse <= 0) {
      const pkgPrice = pkgDoc?.price && Number(pkgDoc.price) > 0 ? Number(pkgDoc.price) : null;
      if (pkgPrice) priceToUse = pkgPrice;
    }
    if (!priceToUse) {
      return res.status(400).json({ success: false, message: 'Price per person is required' });
    }

    const accommodation = await resolveAccommodationForPackage(
      {
        accommodationMode,
        selectedLocation,
        selectedStarRating,
        partnerHotelId,
        accommodationPricePerNight,
        accommodationNights,
      },
      pkgDoc
    );

    const baseTotal = priceToUse * persons;
    const computedTotal = baseTotal + (accommodation?.accommodationTotalCost || 0);
    if (totalAmount && Number(totalAmount) !== computedTotal) {
      return res
        .status(400)
        .json({ success: false, message: 'Total amount mismatch. Please refresh and try again.' });
    }

    const allowedStatus = ['pending', 'confirmed', 'cancelled', 'completed', 'rescheduled'];
    const initialStatus = status && allowedStatus.includes(status) ? status : 'confirmed';

    const booking = await PackageBooking.create({
      packageId: packageId && mongoose.Types.ObjectId.isValid(packageId) ? packageId : undefined,
      packageName: resolvedPackageName,
      userName,
      phone,
      email,
      preferredStartDate,
      peopleCount: persons,
      numberOfPersons: persons,
      pricePerPerson: priceToUse,
      totalAmount: computedTotal,
      notes,
      internalNotes,
      source,
      status: initialStatus,
      createdBy: 'admin',
      accommodationSelected: accommodation.accommodationSelected,
      accommodationMode: accommodation.accommodationMode,
      selectedLocation: accommodation.selectedLocation,
      selectedStarRating: accommodation.selectedStarRating,
      partnerHotelId: accommodation.partnerHotelId,
      accommodationPricePerNight: accommodation.accommodationPricePerNight,
      accommodationNights: accommodation.accommodationNights,
      accommodationTotalCost: accommodation.accommodationTotalCost,
    });

    await upsertPaymentForPackage(booking, initialStatus === 'confirmed' ? 'paid' : 'pending', 'manual');

    if (notifyCustomer && email) {
      try {
        await sendPackageBookingEmail(email, {
          template: 'created-admin',
          status: initialStatus,
          packageName: resolvedPackageName,
          date: preferredStartDate,
          peopleCount: persons,
          pricePerPerson: priceToUse,
          totalAmount: computedTotal,
          duration: pkgDoc?.duration,
          notes,
          adminMessage: internalNotes,
          accommodationMode: accommodation.accommodationMode,
          selectedLocation: accommodation.selectedLocation,
          selectedStarRating: accommodation.selectedStarRating,
          accommodationPricePerNight: accommodation.accommodationPricePerNight,
          accommodationNights: accommodation.accommodationNights,
          accommodationTotalCost: accommodation.accommodationTotalCost,
        });
      } catch (mailErr) {
        console.error('Package booking email send failed:', mailErr?.message || mailErr);
      }
    }

    return res.status(201).json({ success: true, data: booking });
  } catch (error) {
    console.error('Admin package booking create error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status, adminMessage, preferredStartDate, peopleCount, notes } = req.body;
  const allowed = ['pending', 'confirmed', 'cancelled', 'completed', 'rescheduled'];

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid ID' });
  }
  if (!status || !allowed.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }
  if (status === 'cancelled' && !adminMessage) {
    return res.status(400).json({ success: false, message: 'Cancellation message is required' });
  }
  if (status === 'rescheduled' && !preferredStartDate) {
    return res.status(400).json({ success: false, message: 'New date is required for reschedule' });
  }

  try {
    const update = { status };
    if (adminMessage !== undefined) update.adminMessage = adminMessage;
    if (preferredStartDate) update.preferredStartDate = preferredStartDate;
    if (typeof peopleCount !== 'undefined') {
      update.peopleCount = Number(peopleCount) || 1;
      update.numberOfPersons = Number(peopleCount) || 1;
    }
    if (typeof notes !== 'undefined') update.notes = notes;

    const booking = await PackageBooking.findByIdAndUpdate(id, update, { new: true });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Not Found' });
    }

    try {
      if (booking.email) {
        await sendPackageBookingEmail(booking.email, {
          status,
          packageName: booking.packageName || 'Health Package',
          date: booking.preferredStartDate,
          peopleCount: booking.peopleCount,
          pricePerPerson: booking.pricePerPerson,
          totalAmount: booking.totalAmount,
          duration: booking.duration || booking.packageDuration,
          adminMessage,
          notes: booking.notes,
        });
      }
    } catch (mailErr) {
      console.error('Package booking email send failed:', mailErr?.message || mailErr);
    }

    return res.json({ success: true, data: booking });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.remove = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid ID' });
  }
  try {
    const deleted = await PackageBooking.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Not Found' });
    }
    return res.json({ success: true, data: deleted });
  } catch (error) {
    console.error('Package booking delete error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateDetails = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid ID' });
  }

  try {
    const existing = await PackageBooking.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Not Found' });
    }

    const {
      packageId,
      packageName,
      userName,
      phone,
      email,
      preferredStartDate,
      peopleCount,
      numberOfPersons,
      pricePerPerson,
      totalAmount,
      notes,
      status,
      notifyCustomer,
      accommodationMode,
      selectedLocation,
      selectedStarRating,
      partnerHotelId,
      accommodationPricePerNight,
      accommodationNights,
      accommodationTotalCost,
    } = buildPayload(req.body);

    if (!userName || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone are required' });
    }

    let resolvedPackageName = packageName || existing.packageName;
    let pkgDoc = null;
    if (packageId && mongoose.Types.ObjectId.isValid(packageId)) {
      pkgDoc = await Package.findById(packageId);
      if (pkgDoc) {
        resolvedPackageName = pkgDoc.name;
      }
    }

    const persons = Number(numberOfPersons || peopleCount || existing.peopleCount || 1);
    if (!Number.isFinite(persons) || persons < 1) {
      return res.status(400).json({ success: false, message: 'Number of persons must be at least 1' });
    }

    let priceToUse = pricePerPerson ? Number(pricePerPerson) : existing.pricePerPerson;
    if (!priceToUse || !Number.isFinite(priceToUse) || priceToUse <= 0) {
      const pkg = packageId && mongoose.Types.ObjectId.isValid(packageId) ? await Package.findById(packageId) : null;
      const pkgPrice = pkg?.price && Number(pkg.price) > 0 ? Number(pkg.price) : null;
      if (pkgPrice) priceToUse = pkgPrice;
    }
    if (!priceToUse) {
      return res.status(400).json({ success: false, message: 'Price per person is required' });
    }

    const accommodationTotal =
      accommodationTotalCost !== undefined
        ? Number(accommodationTotalCost)
        : Number(existing.accommodationTotalCost || 0);
    const computedTotal = priceToUse * persons + accommodationTotal;
    if (totalAmount && Number(totalAmount) !== computedTotal) {
      return res
        .status(400)
        .json({ success: false, message: 'Total amount mismatch. Please refresh and try again.' });
    }

    const update = {
      packageId: packageId && mongoose.Types.ObjectId.isValid(packageId) ? packageId : existing.packageId,
      packageName: resolvedPackageName,
      userName,
      phone,
      email,
      preferredStartDate: preferredStartDate || existing.preferredStartDate,
      peopleCount: persons,
      numberOfPersons: persons,
      pricePerPerson: priceToUse,
      totalAmount: computedTotal,
      notes: typeof notes !== 'undefined' ? notes : existing.notes,
      duration: pkgDoc?.duration || existing.duration,
      accommodationMode: accommodationMode ?? existing.accommodationMode,
      selectedLocation: selectedLocation ?? existing.selectedLocation,
      selectedStarRating: selectedStarRating ?? existing.selectedStarRating,
      partnerHotelId: partnerHotelId ?? existing.partnerHotelId,
      accommodationPricePerNight:
        accommodationPricePerNight !== undefined
          ? accommodationPricePerNight
          : existing.accommodationPricePerNight,
      accommodationNights:
        accommodationNights !== undefined ? accommodationNights : existing.accommodationNights,
      accommodationTotalCost: accommodationTotal,
    };
    if (status) update.status = status;
    if (adminMessage !== undefined) update.adminMessage = adminMessage;
    if (paymentStatus) update.paymentStatus = paymentStatus;

    const booking = await PackageBooking.findByIdAndUpdate(id, update, { new: true });
    if (booking) {
      await Payment.findOneAndUpdate(
        { bookingId: booking._id, bookingType: 'health' },
        {
          status: booking.paymentStatus || paymentStatus || 'pending',
          amount: booking.totalAmount || booking.totalAmountUSD || 0,
          userName: booking.userName || booking.name,
          userEmail: booking.email,
        },
        { upsert: true }
      );
    }

    if (notifyCustomer && booking?.email) {
      try {
        await sendPackageBookingEmail(booking.email, {
          status: booking.status,
          packageName: booking.packageName,
          date: booking.preferredStartDate,
          peopleCount: booking.peopleCount,
          pricePerPerson: booking.pricePerPerson,
          totalAmount: booking.totalAmount,
          notes: booking.notes,
          adminMessage: update.adminMessage,
        });
      } catch (mailErr) {
        console.error('Package booking edit email failed:', mailErr?.message || mailErr);
      }
    }

    return res.json({ success: true, data: booking });
  } catch (error) {
    console.error('Package booking update error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};
