const express = require('express');
const controller = require('../../controllers/appointmentController');
const { authenticate, requireAdmin } = require('../../middleware/authMiddleware');

const router = express.Router();

router.post('/book', controller.bookAppointment);
router.post('/', controller.createAppointment);
router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.put('/:id', authenticate, requireAdmin, controller.update);
router.delete('/:id', authenticate, requireAdmin, controller.remove);
router.patch('/:id/status', authenticate, requireAdmin, controller.updateStatus);

module.exports = router;
