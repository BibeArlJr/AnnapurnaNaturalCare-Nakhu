const RetreatBooking = require('../models/RetreatBooking');
const Payment = require('../models/Payment');
const RetreatProgram = require('../models/RetreatProgram');
const PartnerHotel = require('../models/PartnerHotel');
const { sendRetreatBookingEmail } = require('../utils/mailer');

function computeTotal(pricePerPersonUSD, numberOfPeople = 1) {
  const price = Number(pricePerPersonUSD) || 0;
  const people = Number(numberOfPeople) || 1;
  return price * people;
}

async function resolveHotelSelection(_programId, payload, durationDays, numberOfPeople = 1) {
  const {
    hotelMode = 'none',
    hotelLocation,
    hotelStarRating,
    hotelOptionId,
    partnerHotelId,
  } = payload || {};

  if (hotelMode === 'none') {
    return {
      hotelMode: 'none',
      hotelLocation: null,
      hotelStarRating: null,
      hotelPricePerNight: 0,
      hotelNights: durationDays || 0,
      hotelTotalCost: 0,
      accommodationChoice: 'none',
      accommodationLabel: 'No partner hotel',
      accommodationPricePerPerson: 0,
      accommodationSubtotal: 0,
      accommodationSelected: false,
      accommodationMode: 'none',
      accommodationPricePerNight: 0,
      accommodationNights: durationDays || 0,
      accommodationTotalCost: 0,
    };
  }

  let option = null;
  if (hotelOptionId || partnerHotelId) {
    option = await PartnerHotel.findOne({ _id: hotelOptionId || partnerHotelId, isActive: true });
  } else {
    const query = { isActive: true };
    if (hotelMode === 'location' || hotelMode === 'locationAndStar') {
      if (hotelLocation) query.location = hotelLocation;
    }
    if (hotelMode === 'star' || hotelMode === 'locationAndStar') {
      if (hotelStarRating) query.starRating = hotelStarRating;
    }
    option = await PartnerHotel.findOne(query);
  }
  if (!option) {
    return {
      hotelMode: 'none',
      hotelLocation: null,
      hotelStarRating: null,
      hotelPricePerNight: 0,
      hotelNights: durationDays || 0,
      hotelTotalCost: 0,
      accommodationChoice: 'none',
      accommodationLabel: 'No partner hotel',
      accommodationPricePerPerson: 0,
      accommodationSubtotal: 0,
      accommodationSelected: false,
      accommodationMode: 'none',
      accommodationPricePerNight: 0,
      accommodationNights: durationDays || 0,
      accommodationTotalCost: 0,
    };
  }

  const nights = durationDays || 1;
  const pricePerNight = Number(option.pricePerNight) || 0;
  const hotelTotalCost = pricePerNight * nights * (Number(numberOfPeople) || 1);

  return {
    hotelMode,
    hotelLocation: option.location || hotelLocation || null,
    hotelStarRating: option.starRating || hotelStarRating || null,
    hotelPricePerNight: pricePerNight,
    hotelNights: nights,
    hotelTotalCost,
    partnerHotelId: option._id,
    accommodationChoice: option.mode || 'partner_hotel',
    accommodationLabel: [option.location, option.starRating ? `${option.starRating}★` : null].filter(Boolean).join(' • ') || 'Partner hotel',
    accommodationPricePerPerson: pricePerNight,
    accommodationSubtotal: hotelTotalCost,
    accommodationSelected: true,
    accommodationMode: hotelMode,
    selectedLocation: option.location || hotelLocation || null,
    selectedStarRating: option.starRating || hotelStarRating || null,
    accommodationPricePerNight: pricePerNight,
    accommodationNights: nights,
    accommodationTotalCost: hotelTotalCost,
  };
}

async function upsertPaymentForRetreat(booking, status, gateway = 'manual') {
  if (!booking?._id) return;
  const amount =
    booking.totalAmountUSD ||
    booking.totalPriceUSD ||
    (Number(booking.retreatSubtotal || 0) + Number(booking.accommodationSubtotal || 0));
  const metadata = {
    programId: booking.programId,
    programTitle: booking.programTitle,
    retreatPricePerPerson: booking.retreatPricePerPerson,
    accommodationLabel: booking.accommodationLabel,
    accommodationChoice: booking.accommodationChoice,
    accommodationPricePerPerson: booking.accommodationPricePerPerson,
    accommodationPricePerNight: booking.accommodationPricePerNight || booking.hotelPricePerNight,
    accommodationNights: booking.accommodationNights || booking.hotelNights,
    numberOfPeople: booking.numberOfPeople,
    retreatSubtotal: booking.retreatSubtotal,
    accommodationSubtotal: booking.accommodationSubtotal,
    totalPrice: booking.totalPriceUSD || booking.totalAmountUSD || amount,
  };
  await Payment.findOneAndUpdate(
    { bookingId: booking._id, bookingType: 'retreat' },
    {
      bookingId: booking._id,
      bookingType: 'retreat',
      gateway,
      amount,
      currency: 'USD',
      status,
      userName: booking.userName,
      userEmail: booking.email,
      metadata,
    },
    { upsert: true, new: true }
  );
}

exports.createBooking = async (req, res) => {
  try {
    const {
      programId,
      programTitle,
      fullName,
      userName,
      email,
      country,
      phone,
      preferredStartDate,
      numberOfPeople,
      accommodationChoice,
      additionalNotes,
      paymentStatus,
      paymentSuccess,
      accommodationPreference,
      accommodationPricePerPerson,
      accommodationLabel,
      totalPriceUSD,
      hotelMode = 'none',
      hotelLocation,
      hotelStarRating,
      hotelOptionId,
      partnerHotelId,
      accommodationMode,
      accommodationSelected,
      accommodationPricePerNight,
      accommodationNights,
    } = req.body || {};

    if (!programId) return res.status(400).json({ success: false, message: 'Program is required' });
    const finalName = userName || fullName;
    if (!finalName || !email) return res.status(400).json({ success: false, message: 'Name and email are required' });

    const program = await RetreatProgram.findById(programId);
    if (!program) return res.status(404).json({ success: false, message: 'Program not found' });

    const retreatPricePerPerson = Number(program.pricePerPersonUSD) || 0;
    const peopleCount = Number(numberOfPeople) || 1;
    const hospitalPremiumPrice =
      program?.accommodation?.hospitalPremiumPrice ??
      (program.accommodationPricing || []).find((p) => p.key === 'hospital_premium')?.pricePerPersonUSD;

    const chosenAccommodation = accommodationChoice || accommodationPreference || hotelMode;
    let accommodationSubtotal = 0;
    let selectedAccommodationLabel = accommodationLabel || '';
    let accommodationPricePerPersonResolved = accommodationPricePerPerson;
    let accommodationPricePerNightResolved = accommodationPricePerNight;
    let accommodationNightsResolved = accommodationNights;
    let accommodationModeResolved = accommodationMode || hotelMode || 'none';
    let accommodationSelectedResolved = accommodationSelected || false;
    let selectedLocationResolved = hotelLocation;
    let selectedStarResolved = hotelStarRating;
    let partnerHotelResolved = partnerHotelId;
    let hotelPricePerNight = 0;
    let hotelTotalCost = 0;

    const durationDays = program.durationDays || program.duration || 0;
    if (chosenAccommodation === 'hospital_premium') {
      const nights = durationDays || 1;
      const pricePerNight = hospitalPremiumPrice ? Number(hospitalPremiumPrice) : 0;
      accommodationSubtotal = pricePerNight * nights * peopleCount;
      selectedAccommodationLabel = selectedAccommodationLabel || 'Hospital premium stay';
      accommodationPricePerPersonResolved = pricePerNight;
      accommodationPricePerNightResolved = pricePerNight;
      accommodationNightsResolved = nights;
      accommodationModeResolved = 'hospital_premium';
      accommodationSelectedResolved = true;
    } else if (chosenAccommodation === 'own_arrangement') {
      accommodationSubtotal = 0;
      selectedAccommodationLabel = selectedAccommodationLabel || 'Own arrangement';
      accommodationModeResolved = 'own_arrangement';
      accommodationSelectedResolved = false;
    } else {
      const hotelSelection = await resolveHotelSelection(
        programId,
        { hotelMode, hotelLocation, hotelStarRating, hotelOptionId, partnerHotelId },
        durationDays,
        peopleCount
      );
      accommodationSubtotal = hotelSelection.accommodationSubtotal || 0;
      selectedAccommodationLabel = hotelSelection.accommodationLabel || selectedAccommodationLabel || 'Partner hotel';
      accommodationPricePerPersonResolved = hotelSelection.accommodationPricePerPerson;
      accommodationPricePerNightResolved = hotelSelection.accommodationPricePerNight;
      accommodationNightsResolved = hotelSelection.accommodationNights;
      accommodationModeResolved = hotelSelection.accommodationMode || 'partner_hotel';
      accommodationSelectedResolved = hotelSelection.accommodationSelected;
      selectedLocationResolved = hotelSelection.selectedLocation || hotelLocation;
      selectedStarResolved = hotelSelection.selectedStarRating || hotelStarRating;
      partnerHotelResolved = hotelSelection.partnerHotelId;
      hotelPricePerNight = hotelSelection.hotelPricePerNight;
      hotelTotalCost = hotelSelection.hotelTotalCost;
    }

    const retreatSubtotal = computeTotal(retreatPricePerPerson, peopleCount);
    const totalAmountUSD = totalPriceUSD !== undefined ? Number(totalPriceUSD) : retreatSubtotal + accommodationSubtotal;

    const shouldMarkPaid = paymentStatus === 'paid' || paymentSuccess === true;
    const bookingStatus = shouldMarkPaid ? 'confirmed' : 'pending';
    const bookingPaymentStatus = shouldMarkPaid ? 'paid' : paymentStatus === 'failed' ? 'failed' : 'pending';

    const booking = await RetreatBooking.create({
      programId,
      programTitle: programTitle || program.title,
      userName: finalName,
      email,
      country,
      phone,
      preferredStartDate: preferredStartDate ? new Date(preferredStartDate) : undefined,
      numberOfPeople: peopleCount,
      accommodationChoice: chosenAccommodation || accommodationPreference || accommodationChoice,
      accommodationLabel: selectedAccommodationLabel,
      accommodationPricePerPerson: accommodationPricePerPersonResolved ?? 0,
      retreatPricePerPerson,
      retreatSubtotal,
      accommodationSubtotal,
      additionalNotes,
      totalPriceUSD: totalAmountUSD,
      totalAmountUSD,
      hotelMode,
      hotelLocation: selectedLocationResolved,
      hotelStarRating: selectedStarResolved,
      hotelPricePerNight,
      hotelNights: accommodationNightsResolved,
      hotelTotalCost,
      partnerHotelId: partnerHotelResolved,
      accommodationSelected: accommodationSelectedResolved,
      accommodationMode: accommodationModeResolved,
      selectedLocation: selectedLocationResolved,
      selectedStarRating: selectedStarResolved,
      accommodationPricePerNight: accommodationPricePerNightResolved,
      accommodationNights: accommodationNightsResolved,
      accommodationTotalCost: accommodationSubtotal,
      status: bookingStatus,
      paymentStatus: bookingPaymentStatus,
    });

    await upsertPaymentForRetreat(
      booking,
      bookingPaymentStatus === 'paid' ? 'paid' : 'pending',
      bookingPaymentStatus === 'paid' ? 'stripe' : 'manual'
    );

    await sendRetreatBookingEmail(email, { ...booking.toObject(), program });

    return res.status(201).json({ success: true, data: booking });
  } catch (err) {
    console.error('Create retreat booking error:', err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.getAll = async (_req, res) => {
  try {
    const bookings = await RetreatBooking.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: bookings });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await RetreatBooking.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: 'Not found' });

    const {
      userName,
      email,
      phone,
      country,
      preferredStartDate,
      numberOfPeople,
      retreatPricePerPerson,
      accommodationTotalCost,
      status,
      paymentStatus,
      adminMessage,
      additionalNotes,
    } = req.body || {};

    const people = Number((numberOfPeople ?? booking.numberOfPeople) || 1) || 1;
    const pricePerPerson = Number((retreatPricePerPerson ?? booking.retreatPricePerPerson) || 0);
    const accom = accommodationTotalCost !== undefined ? Number(accommodationTotalCost) : Number(booking.accommodationTotalCost || booking.accommodationSubtotal || 0);
    const total = pricePerPerson * people + accom;

    const updates = {
      userName: userName ?? booking.userName,
      email: email ?? booking.email,
      phone: phone ?? booking.phone,
      country: country ?? booking.country,
      preferredStartDate: preferredStartDate ?? booking.preferredStartDate,
      numberOfPeople: people,
      retreatPricePerPerson: pricePerPerson,
      accommodationTotalCost: accom,
      accommodationSubtotal: accom,
      totalAmountUSD: total,
      totalPriceUSD: total,
      additionalNotes: additionalNotes ?? booking.additionalNotes,
    };

    if (status) updates.status = status;
    if (paymentStatus) updates.paymentStatus = paymentStatus;
    if (adminMessage !== undefined) updates.adminMessage = adminMessage;

    if (updates.paymentStatus === 'paid' && !updates.status) {
      updates.status = 'confirmed';
    }

    const updated = await RetreatBooking.findByIdAndUpdate(id, updates, { new: true });

    if (updated) {
      await Payment.findOneAndUpdate(
        { bookingId: updated._id, bookingType: 'retreat' },
        {
          status: updated.paymentStatus || paymentStatus || 'pending',
          amount: updated.totalAmountUSD || updated.totalPriceUSD || total || 0,
          userName: updated.userName,
          userEmail: updated.email,
          metadata: {
            programId: updated.programId,
            programTitle: updated.programTitle,
            numberOfPeople: updated.numberOfPeople,
            retreatPricePerPerson: updated.retreatPricePerPerson,
            accommodationTotalCost: updated.accommodationTotalCost,
          },
        },
        { upsert: true }
      );
    }

    const program = await RetreatProgram.findById(updated.programId);
    if (updated?.email) {
      await sendRetreatBookingEmail(updated.email, { ...updated.toObject(), program, adminMessage: updates.adminMessage });
    }

    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Update retreat booking error:', err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.removeBooking = async (req, res) => {
  try {
    await RetreatBooking.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  } catch (err) {
    console.error('Delete retreat booking error:', err);
    return res.status(400).json({ success: false, message: err.message });
  }
};
