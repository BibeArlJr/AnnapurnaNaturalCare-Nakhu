const dayjs = require('dayjs');
const PDFDocument = require('pdfkit');
const Payment = require('../models/Payment');
const PackageBooking = require('../models/PackageBooking');
const RetreatBooking = require('../models/RetreatBooking');
const CourseBooking = require('../models/CourseBooking');
const HealthProgramBooking = require('../models/HealthProgramBooking');

function buildQuery(params = {}) {
  const query = {};
  if (params.status && params.status !== 'all') {
    query.status = params.status;
  } else {
    // Hide cancelled by default unless explicitly requested
    query.status = { $ne: 'cancelled' };
  }
  if (params.bookingType) query.bookingType = params.bookingType;
  if (params.email) query.userEmail = new RegExp(params.email, 'i');
  if (params.startDate || params.endDate) {
    query.createdAt = {};
    if (params.startDate) query.createdAt.$gte = new Date(params.startDate);
    if (params.endDate) {
      const end = dayjs(params.endDate).endOf('day').toDate();
      query.createdAt.$lte = end;
    }
  }
  return query;
}

async function computeTotals(list) {
  const totals = { paidAmount: 0, pendingAmount: 0, count: list.length };
  list.forEach((p) => {
    if (p.status === 'paid') totals.paidAmount += Number(p.amount) || 0;
    if (p.status === 'pending') totals.pendingAmount += Number(p.amount) || 0;
  });
  return totals;
}

exports.list = async (req, res) => {
  try {
    const query = buildQuery(req.query || {});
    const payments = await Payment.find(query).sort({ createdAt: -1 });
    const totals = await computeTotals(payments);
    return res.json({ success: true, data: payments, totals });
  } catch (err) {
    console.error('Payments list error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch payments' });
  }
};

exports.getById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, data: payment });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!status) return res.status(400).json({ success: false, message: 'Status is required' });
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!payment) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, data: payment });
  } catch (err) {
    console.error('Payment status update error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update payment' });
  }
};

async function updateLinkedBooking(payment, updateFields = {}, note) {
  if (!payment.bookingId || !payment.bookingType) return;
  if (payment.bookingType === 'health') {
    const booking = await PackageBooking.findById(payment.bookingId);
    if (!booking) return;
    Object.assign(booking, updateFields);
    if (note) booking.adminMessage = [booking.adminMessage, note].filter(Boolean).join(' | ');
    await booking.save();
  } else if (payment.bookingType === 'retreat') {
    const booking = await RetreatBooking.findById(payment.bookingId);
    if (!booking) return;
    Object.assign(booking, updateFields);
    if (note) booking.adminMessage = [booking.adminMessage, note].filter(Boolean).join(' | ');
    await booking.save();
  } else if (payment.bookingType === 'course') {
    const booking = await CourseBooking.findById(payment.bookingId);
    if (!booking) return;
    Object.assign(booking, updateFields);
    await booking.save();
  } else if (payment.bookingType === 'health_program') {
    const booking = await HealthProgramBooking.findById(payment.bookingId);
    if (!booking) return;
    Object.assign(booking, updateFields);
    await booking.save();
  }
}

exports.cancelPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Not found' });

    payment.status = 'cancelled';
    payment.cancelledAt = new Date();
    if (req.user && req.user.id) payment.cancelledBy = req.user.id;
    await payment.save();

    await updateLinkedBooking(
      payment,
      { paymentStatus: 'pending', status: 'cancelled' },
      `Payment cancelled by admin at ${dayjs().format('YYYY-MM-DD HH:mm')}`
    );

    return res.json({ success: true, data: payment });
  } catch (err) {
    console.error('Payment cancel error:', err);
    return res.status(500).json({ success: false, message: 'Failed to cancel payment' });
  }
};

exports.markPaid = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Not found' });

    payment.status = 'paid';
    payment.cancelledAt = undefined;
    payment.cancelledBy = undefined;
    await payment.save();

    await updateLinkedBooking(
      payment,
      { paymentStatus: 'paid', status: 'confirmed' },
      `Payment marked paid by admin at ${dayjs().format('YYYY-MM-DD HH:mm')}`
    );

    return res.json({ success: true, data: payment });
  } catch (err) {
    console.error('Payment markPaid error:', err);
    return res.status(500).json({ success: false, message: 'Failed to mark payment paid' });
  }
};

function toCsv(payments) {
  const header = ['Payment ID', 'Type', 'Name', 'Email', 'Amount', 'Currency', 'Status', 'Gateway', 'Date'];
  const rows = payments.map((p) => [
    p._id,
    p.bookingType,
    p.userName || '',
    p.userEmail || '',
    p.amount || 0,
    p.currency || 'USD',
    p.status,
    p.gateway,
    dayjs(p.createdAt).format('YYYY-MM-DD HH:mm'),
  ]);
  return [header, ...rows].map((r) => r.join(',')).join('\n');
}

async function paymentsForExport(query) {
  return Payment.find(query).sort({ createdAt: -1 });
}

exports.exportCsv = async (req, res) => {
  try {
    const query = buildQuery(req.query || {});
    const payments = await paymentsForExport(query);
    const csv = toCsv(payments);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=\"payments.csv\"');
    return res.send(csv);
  } catch (err) {
    console.error('Payments CSV export error:', err);
    return res.status(500).json({ success: false, message: 'Failed to export CSV' });
  }
};

exports.exportPdf = async (req, res) => {
  try {
    const query = buildQuery(req.query || {});
    const payments = await paymentsForExport(query);
    const totals = await computeTotals(payments);

    const doc = new PDFDocument({ margin: 40 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=\"payments.pdf\"');
      res.send(pdfBuffer);
    });

    doc.fontSize(16).text('Annapurna Nature Cure Hospital - Payments', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated: ${dayjs().format('YYYY-MM-DD HH:mm')}`);
    doc.text(`Total paid: $${totals.paidAmount.toFixed(2)} | Pending: $${totals.pendingAmount.toFixed(2)} | Count: ${totals.count}`);
    doc.moveDown();

    const headers = ['ID', 'Type', 'Name', 'Email', 'Amount', 'Status', 'Gateway', 'Date'];
    doc.font('Helvetica-Bold');
    headers.forEach((h) => doc.text(h, { continued: h !== 'Date' }));
    doc.text('\n');
    doc.font('Helvetica');
    payments.forEach((p) => {
      doc.text(p._id.toString(), { continued: true });
      doc.text(` ${p.bookingType}`, { continued: true });
      doc.text(` ${p.userName || ''}`, { continued: true });
      doc.text(` ${p.userEmail || ''}`, { continued: true });
      doc.text(` $${(p.amount || 0).toFixed(2)}`, { continued: true });
      doc.text(` ${p.status}`, { continued: true });
      doc.text(` ${p.gateway}`, { continued: true });
      doc.text(` ${dayjs(p.createdAt).format('YYYY-MM-DD')}`);
    });

    doc.end();
  } catch (err) {
    console.error('Payments PDF export error:', err);
    return res.status(500).json({ success: false, message: 'Failed to export PDF' });
  }
};
