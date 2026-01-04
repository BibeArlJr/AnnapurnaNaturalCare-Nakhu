const express = require('express');
const { authenticate, requireAdmin } = require('../../middleware/authMiddleware');
const controller = require('../../controllers/packageBookingController');

const router = express.Router();

router.post('/', authenticate, requireAdmin, controller.createAdmin);

module.exports = router;
