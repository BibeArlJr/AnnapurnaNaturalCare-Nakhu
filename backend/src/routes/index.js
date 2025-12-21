const express = require('express');

const departmentRoutes = require('./api/departmentRoutes');
const doctorRoutes = require('./api/doctorRoutes');
const appointmentRoutes = require('./api/appointmentRoutes');
const blogRoutes = require('./api/blogRoutes');
const blogCategoryRoutes = require('./api/blogCategoryRoutes');
const galleryRoutes = require('./api/galleryRoutes');
const packageRoutes = require('./api/packageRoutes');
const messageRoutes = require('./api/messageRoutes');
const contactRoutes = require('./api/contactRoutes');
const authRoutes = require('./api/authRoutes');
const uploadRoutes = require('./uploadRoutes');

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
router.use('/messages', messageRoutes);
router.use('/contact', contactRoutes);
router.use('/auth', authRoutes);
router.use('/upload', uploadRoutes);

module.exports = router;
