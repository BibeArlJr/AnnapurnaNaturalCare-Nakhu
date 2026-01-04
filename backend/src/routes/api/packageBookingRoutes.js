const express = require('express');
const { authenticate, requireAdmin } = require('../../middleware/authMiddleware');
const controller = require('../../controllers/packageBookingController');

const router = express.Router();

router.post('/', controller.create);
router.get('/', authenticate, requireAdmin, controller.getAll);
router.patch('/:id/status', authenticate, requireAdmin, controller.updateStatus);
router.put('/:id', authenticate, requireAdmin, controller.updateDetails);
router.delete('/:id', authenticate, requireAdmin, controller.remove);

module.exports = router;
