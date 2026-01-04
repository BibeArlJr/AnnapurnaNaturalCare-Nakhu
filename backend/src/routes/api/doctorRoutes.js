const express = require('express');
const controller = require('../../controllers/doctorController');
const { authenticate, requireAdmin } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/:id/availability', controller.getAvailability);
router.get('/', controller.getDoctors);
router.get('/:id', controller.getOne);
router.patch('/:id/status', authenticate, requireAdmin, controller.updateStatus);
router.post('/', authenticate, requireAdmin, controller.create);
router.post('/upload', authenticate, requireAdmin, controller.uploadImageOnly);
router.put('/:id', authenticate, requireAdmin, controller.update);
router.delete('/:id', authenticate, requireAdmin, controller.remove);

module.exports = router;
