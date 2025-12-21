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
