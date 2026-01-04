const express = require('express');
const controller = require('../../controllers/healthProgramBookingController');
const { authenticate, requireAdmin } = require('../../middleware/authMiddleware');

const router = express.Router();

router.post('/', controller.create);
router.get('/', authenticate, requireAdmin, controller.list);
router.patch('/:id/status', authenticate, requireAdmin, controller.updateStatus);
router.put('/:id', authenticate, requireAdmin, controller.update);
router.delete('/:id', authenticate, requireAdmin, controller.remove);

module.exports = router;
