const express = require('express');

const departmentRoutes = require('./api/departmentRoutes');
const doctorRoutes = require('./api/doctorRoutes');
const appointmentRoutes = require('./api/appointmentRoutes');
const blogRoutes = require('./api/blogRoutes');
const blogCategoryRoutes = require('./api/blogCategoryRoutes');
const galleryRoutes = require('./api/galleryRoutes');
const packageRoutes = require('./api/packageRoutes');
const packageBookingRoutes = require('./api/packageBookingRoutes');
const adminPackageBookingRoutes = require('./api/adminPackageBookingRoutes');
const retreatProgramRoutes = require('./api/retreatProgramRoutes');
const retreatBookingRoutes = require('./api/retreatBookingRoutes');
const retreatDestinationRoutes = require('./api/retreatDestinationRoutes');
const treatmentTypeRoutes = require('./api/treatmentTypeRoutes');
const messageRoutes = require('./api/messageRoutes');
const contactRoutes = require('./api/contactRoutes');
const authRoutes = require('./api/authRoutes');
const adminPaymentRoutes = require('./api/adminPaymentRoutes');
const paymentRoutes = require('./payments');
const uploadRoutes = require('./uploadRoutes');
const searchRoutes = require('./api/searchRoutes');
const patientReviewRoutes = require('./api/patientReviewRoutes');
const healthProgramRoutes = require('./api/healthProgramRoutes');
const healthProgramBookingRoutes = require('./api/healthProgramBookingRoutes');
const courseRoutes = require('./api/courseRoutes');
const courseCategoryRoutes = require('./api/courseCategoryRoutes');
const courseBookingRoutes = require('./api/courseBookingRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/departments', departmentRoutes);
router.use('/doctors', doctorRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/blogs', blogRoutes);
router.use('/blog/categories', blogCategoryRoutes);
router.use('/gallery', galleryRoutes);
router.use('/packages', packageRoutes);
router.use('/package-bookings', packageBookingRoutes);
router.use('/admin/package-bookings', adminPackageBookingRoutes);
router.use('/retreat-programs', retreatProgramRoutes);
router.use('/partner-hotels', require('./api/partnerHotelRoutes'));
router.use('/retreat-bookings', retreatBookingRoutes);
router.use('/health-programs', healthProgramRoutes);
router.use('/health-program-bookings', healthProgramBookingRoutes);
router.use('/courses', courseRoutes);
router.use('/course-categories', courseCategoryRoutes);
router.use('/course-bookings', courseBookingRoutes);
router.use('/retreat-destinations', retreatDestinationRoutes);
router.use('/treatment-types', treatmentTypeRoutes);
router.use('/messages', messageRoutes);
router.use('/contact', contactRoutes);
router.use('/auth', authRoutes);
router.use('/admin/payments', adminPaymentRoutes);
router.use('/payments', paymentRoutes);
router.use('/upload', uploadRoutes);
router.use('/search', searchRoutes);
router.use('/patient-reviews', patientReviewRoutes);

module.exports = router;
