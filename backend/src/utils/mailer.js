const nodemailer = require('nodemailer');

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  const sender =
    process.env.SMTP_USER ||
    process.env.NOTIFY_EMAIL ||
    process.env.CONTACT_EMAIL;
  const senderPass =
    process.env.SMTP_PASS ||
    process.env.NOTIFY_EMAIL_PASSWORD ||
    process.env.CONTACT_EMAIL_PASSWORD;

  if (!sender || !senderPass) {
    console.warn('Mailer not configured: missing NOTIFY_EMAIL/CONTACT_EMAIL credentials');
    return null;
  }

  // one-time debug to verify we are using the app password (length should be 16)
  console.log('[mailer] initializing transporter with user', sender);
  console.log('[mailer] app password length', senderPass.length);

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: sender,
      pass: senderPass,
    },
  });

  return transporter;
}

exports.sendAppointmentEmail = async (to, appt) => {
  const tx = getTransporter();
  if (!tx || !to) {
    console.warn('[mailer] missing transporter or recipient, skip email', { to });
    return;
  }

  const formattedDate = appt?.date ? new Date(appt.date).toLocaleDateString() : '';
  const fromEmail =
    process.env.SMTP_USER ||
    process.env.NOTIFY_EMAIL ||
    process.env.CONTACT_EMAIL;
  const subjectStatus = appt?.status ? ` – ${appt.status.toUpperCase()}` : '';

  try {
    console.log('[mailer] sending appointment email', { to, subject: `Your Appointment Update${subjectStatus}` });
    await tx.sendMail({
      from: fromEmail,
      to,
      subject: `Your Appointment Update${subjectStatus}`,
      html: `
        <h3>Appointment Update</h3>
        <p><strong>Status:</strong> ${appt?.status || 'pending'}</p>
        <p><strong>Doctor:</strong> ${appt?.doctorName || appt?.doctor || '—'}</p>
        <p><strong>Department:</strong> ${appt?.departmentName || appt?.service || '—'}</p>
        <p><strong>Date:</strong> ${formattedDate || appt?.date || ''}</p>
        <p><strong>Time:</strong> ${appt?.time || ''}</p>
        ${appt?.adminMessage ? `<p><strong>Message from our team:</strong></p><p>${appt.adminMessage}</p>` : ''}
        <p>Thank you.</p>
      `,
    });
    console.log('[mailer] appointment email sent');
  } catch (err) {
    console.error('[mailer] sendAppointmentEmail failed:', err?.message || err);
  }
};

exports.sendPackageBookingEmail = async (to, payload) => {
  const tx = getTransporter();
  if (!tx || !to) {
    console.warn('[mailer] missing transporter or recipient, skip package email', { to });
    return;
  }

  const fromEmail =
    process.env.SMTP_USER ||
    process.env.NOTIFY_EMAIL ||
    process.env.CONTACT_EMAIL;

  const status = payload?.status || 'pending';
  const date = payload?.date ? new Date(payload.date).toLocaleDateString() : '';
  const reason = payload?.adminMessage;
  const extraNotes = payload?.notes;
  const packageName = payload?.packageName || 'Health Package';
  const duration = payload?.duration ? `${payload.duration} days` : '';
  const perPerson = payload?.pricePerPerson ? `NPR ${payload.pricePerPerson}` : '—';
  const persons = payload?.peopleCount || payload?.numberOfPersons || 1;
  const total = payload?.totalAmount ? `NPR ${payload.totalAmount}` : payload?.pricePerPerson ? `NPR ${payload.pricePerPerson * persons}` : '—';

  const pricingLines = [
    duration ? `<p><strong>Duration:</strong> ${duration}</p>` : '',
    `<p><strong>Price per person:</strong> ${perPerson}</p>`,
    `<p><strong>Number of persons:</strong> ${persons}</p>`,
    `<p><strong>Total amount:</strong> ${total}</p>`,
    `<p class="text-sm" style="color:#4b5563;">The total cost for your selected health package has been calculated based on the number of participants.</p>`,
  ].filter(Boolean);

  let subject = 'Your Package Booking';
  let intro = 'Thank you for choosing us. Here is your booking update:';

  if (payload?.template === 'created-admin') {
    subject = 'We created a package booking for you';
    intro = 'Our team has created a booking on your behalf.';
  } else if (status === 'confirmed') {
    subject = 'Your package booking is confirmed';
    intro = 'Great news! Your package booking is confirmed.';
  } else if (status === 'rescheduled') {
    subject = 'Your package booking was rescheduled';
    intro = 'We have rescheduled your package booking.';
  } else if (status === 'cancelled') {
    subject = 'Your package booking was cancelled';
    intro = 'Your package booking has been cancelled.';
  }

  const notesBlock = extraNotes ? `<p><strong>Notes from the customer:</strong></p><p>${extraNotes}</p>` : '';
  const reasonBlock = reason ? `<p><strong>Message from our team:</strong></p><p>${reason}</p>` : '';
  const accommodationLines =
    payload?.accommodationMode && payload.accommodationMode !== 'none'
      ? [
          `<p><strong>Accommodation:</strong> ${payload.selectedLocation || ''} ${
            payload.selectedStarRating ? `(${payload.selectedStarRating}★)` : ''
          }</p>`,
          payload.accommodationPricePerNight
            ? `<p><strong>Price per night:</strong> ${payload.accommodationPricePerNight}</p>`
            : '',
          payload.accommodationNights
            ? `<p><strong>Nights:</strong> ${payload.accommodationNights}</p>`
            : '',
          payload.accommodationTotalCost
            ? `<p><strong>Accommodation total:</strong> ${payload.accommodationTotalCost}</p>`
            : '',
        ].filter(Boolean)
      : [];

  const baseLines = [
    `<p><strong>Package:</strong> ${packageName}</p>`,
    date ? `<p><strong>Preferred start date:</strong> ${date}</p>` : '',
    ...pricingLines,
    ...accommodationLines,
  ].filter(Boolean);

  const disclaimerBlock = `
    <p style="margin-top:12px;"><strong>Important:</strong> Extra charges apply for any activities or services not listed in the program description.</p>
    <p><strong>Refund Policy:</strong> After payment, booking cancellations will incur a 10% deduction of the total booking cost.</p>
  `;

  try {
    console.log('[mailer] sending package email', { to, subject });
    await tx.sendMail({
      from: fromEmail,
      to,
      subject,
      html: `
        <h3>${subject}</h3>
        <p>${intro}</p>
        ${baseLines.join('')}
        ${reasonBlock}
        ${notesBlock}
        ${disclaimerBlock}
        <p>If you have questions, reply to this email.</p>
      `,
    });
    console.log('[mailer] package email sent');
  } catch (err) {
    console.error('[mailer] sendPackageBookingEmail failed:', err?.message || err);
  }
};

exports.sendRetreatBookingEmail = async (to, payload) => {
  const tx = getTransporter();
  if (!tx || !to) {
    console.warn('[mailer] missing transporter or recipient, skip retreat email', { to });
    return;
  }

  const fromEmail =
    process.env.SMTP_USER ||
    process.env.NOTIFY_EMAIL ||
    process.env.CONTACT_EMAIL;

  const status = payload?.status || 'pending';
  let subject = 'Your Retreat Booking';
  let intro = 'Thank you for choosing our retreat. Here is your booking update:';
  if (status === 'confirmed') {
    subject = 'Your retreat booking is confirmed';
    intro = 'Great news! Your retreat booking is confirmed.';
  } else if (status === 'cancelled') {
    subject = 'Your retreat booking was cancelled';
    intro = 'Your retreat booking has been cancelled.';
  } else if (status === 'rescheduled') {
    subject = 'Your retreat booking was rescheduled';
    intro = 'We have rescheduled your retreat booking.';
  }

  const programTitle = payload?.programTitle || payload?.program?.title || 'Retreat Program';
  const people = payload?.numberOfPeople || 1;
  const total = payload?.totalAmountUSD ? `$${payload.totalAmountUSD}` : '—';
  const perPerson = payload?.program?.pricePerPersonUSD
    ? `$${payload.program.pricePerPersonUSD}`
    : payload?.pricePerPersonUSD
    ? `$${payload.pricePerPersonUSD}`
    : '—';

  const startDate = payload?.preferredStartDate
    ? new Date(payload.preferredStartDate).toLocaleDateString()
    : '';

  const reasonBlock = payload?.adminMessage
    ? `<p><strong>Message from our team:</strong></p><p>${payload.adminMessage}</p>`
    : '';

  const notesBlock = payload?.additionalNotes
    ? `<p><strong>Your notes:</strong></p><p>${payload.additionalNotes}</p>`
    : '';

  const accommodationBlock =
    payload?.accommodationMode && payload.accommodationMode !== 'none'
      ? (() => {
          const label =
            payload.accommodationLabel ||
            payload.selectedLocation ||
            payload.hotelLocation ||
            (payload.accommodationMode === 'hospital_premium' ? 'Hospital premium stay' : 'Partner hotel');
          return `
        <p><strong>Accommodation:</strong> ${label} ${
            payload.selectedStarRating || payload.hotelStarRating
              ? `(${payload.selectedStarRating || payload.hotelStarRating}★)`
              : ''
          }</p>
        ${payload.accommodationPricePerNight ? `<p><strong>Price per night:</strong> $${payload.accommodationPricePerNight}</p>` : ''}
        ${payload.accommodationNights ? `<p><strong>Nights:</strong> ${payload.accommodationNights}</p>` : ''}
        ${payload.accommodationTotalCost ? `<p><strong>Accommodation total:</strong> $${payload.accommodationTotalCost}</p>` : ''}
      `;
        })()
      : '';

  const disclaimerBlock = `
    <p style="margin-top:12px;"><strong>Important:</strong> Extra charges apply for any activities or services not listed in the program description.</p>
    <p><strong>Refund Policy:</strong> After payment, booking cancellations will incur a 10% deduction of the total booking cost.</p>
  `;

  try {
    await tx.sendMail({
      from: fromEmail,
      to,
      subject,
      html: `
        <h3>${subject}</h3>
        <p>${intro}</p>
        <p><strong>Program:</strong> ${programTitle}</p>
        ${startDate ? `<p><strong>Preferred start date:</strong> ${startDate}</p>` : ''}
        <p><strong>Number of people:</strong> ${people}</p>
        <p><strong>Price per person (USD):</strong> ${perPerson}</p>
        <p><strong>Total (USD):</strong> ${total}</p>
        ${accommodationBlock}
        ${reasonBlock}
        ${notesBlock}
        ${disclaimerBlock}
        <p>If you have questions, reply to this email.</p>
      `,
    });
    console.log('[mailer] retreat booking email sent');
  } catch (err) {
    console.error('[mailer] sendRetreatBookingEmail failed:', err?.message || err);
  }
};
