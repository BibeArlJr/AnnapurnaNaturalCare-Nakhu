const express = require('express');
const {
  createBooking,
  getAll,
  updateBooking,
  removeBooking,
} = require('../../controllers/retreatBookingController');
const { authenticate, requireAdmin } = require('../../middleware/authMiddleware');

const router = express.Router();

router.post('/', createBooking);
router.get('/', authenticate, requireAdmin, getAll);
router.put('/:id', authenticate, requireAdmin, updateBooking);
router.delete('/:id', authenticate, requireAdmin, removeBooking);

module.exports = router;
