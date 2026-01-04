const express = require('express');
const { authenticate, requireAdmin } = require('../../middleware/authMiddleware');
const controller = require('../../controllers/adminPaymentController');

const router = express.Router();

router.get('/', authenticate, requireAdmin, controller.list);
router.get('/export/csv', authenticate, requireAdmin, controller.exportCsv);
router.get('/export/pdf', authenticate, requireAdmin, controller.exportPdf);
router.get('/:id', authenticate, requireAdmin, controller.getById);
router.patch('/:id/status', authenticate, requireAdmin, controller.updateStatus);
router.patch('/:id/cancel', authenticate, requireAdmin, controller.cancelPayment);
router.patch('/:id/mark-paid', authenticate, requireAdmin, controller.markPaid);

module.exports = router;
